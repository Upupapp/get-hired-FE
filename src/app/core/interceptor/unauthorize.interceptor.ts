import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler, HttpInterceptor, HttpRequest,
  HttpContextToken,
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Observable, throwError } from "rxjs";
import { catchError, switchMap, tap } from "rxjs/operators";
import { SnackbarService } from '../services/snackbar.service';
import { CoreService } from "../services/core.service";
import { TokenLifecycleService } from "../services/token-lifecycle.service";

// SAFE-401-RECOVERY: marks a request that has already been retried once
// after a refresh attempt, so a second 401 on the SAME request goes
// straight to the hard-logout path instead of trying to refresh again --
// prevents a refresh/retry/401 loop if the backend keeps rejecting the
// retried request for a reason a token refresh can't fix (e.g. a genuinely
// revoked/disabled account).
const RETRIED_AFTER_REFRESH = new HttpContextToken<boolean>(() => false);

@Injectable()
export class UnAuthorizedInterceptor implements HttpInterceptor {
  // BURST-401 DEDUPE: an expired/invalid token doesn't fail one request --
  // an authenticated page in flight typically has several parallel calls in
  // flight (profile, company, jobs, ...), and ALL of them come back 401/403
  // together. Without this flag, each one independently re-ran the full
  // logout()+redirect side effect: N parallel calls meant N backend
  // POST /auth/logout calls fired in the same instant, which is exactly what
  // was flooding that endpoint into its own rate limiter (429s), and N
  // redundant navigations. Reset on the next successful sign-in (state
  // becomes 'true' again), not on a timer -- there's no legitimate reason to
  // repeat this side effect while still signed out.
  //
  // SAFE-401-RECOVERY note: this flag only guards the HARD-LOGOUT side
  // effect below, not the refresh attempt -- TokenLifecycleService.
  // refreshNow() has its own single-flight guard (shareReplay(1) over one
  // shared in-flight HTTP call), so the same burst of parallel 401s that
  // this flag was built for now shares one refresh call and, if it
  // succeeds, all of them quietly retry and continue with no user-visible
  // effect at all.
  private handlingExpiry = false;

  constructor(private router: Router,
    private coreService: CoreService,
    private snackbarService: SnackbarService,
    private tokenLifecycle: TokenLifecycleService,
  ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      tap(() => {
        // Self-clearing: any request that comes back successfully while
        // logged in proves the session is currently fine (e.g. a fresh
        // sign-in's own calls), so the dedupe flag shouldn't keep suppressing
        // handling of a LATER, genuinely new expiry.
        if (this.handlingExpiry && this.coreService.isLoggedIn()) {
          this.handlingExpiry = false;
        }
      }),
      catchError((err: any) => {
        if (!(err instanceof HttpErrorResponse)) {
          return throwError(() => err);
        }

        if (err.status === 401) {
          return this.handle401(request, next, err);
        } else if (err.status === 403) {
          // Authenticated but denied -- not a dead session. Surface the
          // backend's own message when it sent a real, user-safe one;
          // otherwise a generic permission-denied notice. Never logs out
          // or redirects -- the calling component/effect still gets the
          // error and can react (e.g. an inline "not allowed" state)
          // exactly as it already does for any other non-2xx response.
          //
          // (BUGFIX 2026-08-27, get-hired-BE "TAB 12 remediation": 401 means
          // ONLY "not authenticated" and 403 means ONLY "authenticated but
          // denied for this resource/role/permission" -- 403 never implies a
          // dead session, so this branch never logs out.)
          const body = (err as HttpErrorResponse).error;
          const msg = (body && (body.message || body.error)) || `You don't have permission to do that.`;
          this.snackbarService.error(msg, '');
        } else if (err.status === 429) {
          // NOTIFY QA11 (SEC-01): Rate-limit hit. Do NOT log the user out.
          // Show a non-destructive warning so the user knows to wait, not retry
          // immediately. The snackbar is informational, not a session signal.
          this.snackbarService.warning(
            `You've made too many requests. Please wait a moment and try again.`,
            '', 5000
          );
        }
        return throwError(() => err);
      }),
    );
  }

  /**
   * SAFE-401-RECOVERY: a 401 no longer means an immediate hard logout by
   * default. If this session has a refresh token to try (TokenLifecycle
   * Service.refreshNow() -- single-flight, shared with the proactive
   * background timer), attempt one silent refresh and, if it succeeds,
   * retry this exact request once with the new token and let it continue
   * completely transparently -- no toast, no redirect, no lost in-progress
   * action. Only if refreshing genuinely fails (or this request has
   * already been retried once) does this fall through to the existing
   * hard-logout path below, unchanged from before.
   */
  private handle401(request: HttpRequest<any>, next: HttpHandler, err: HttpErrorResponse): Observable<HttpEvent<any>> {
    // GUEST FIX (2026-08-19, unchanged): a 401 only means "your session
    // expired" for someone who HAD a local session to begin with. A true
    // first-time guest (isLoggedIn() false -- no local session state at
    // all) calling a request the app itself never expected to require auth
    // would otherwise be told their session "expired" and get force-
    // redirected away, even though they were never signed in. Propagate as-
    // is; the calling component/effect is better positioned to show an
    // accurate, contextual message.
    if (!this.coreService.isLoggedIn()) {
      return throwError(() => err);
    }

    // MANDATORY-LOGOUT FIX: a silent refresh must never override a
    // deliberate security logout that's already in progress (currently:
    // SecurityLogoutCountdownComponent's post-password-change countdown).
    // The password change may or may not have also invalidated the refresh
    // token depending on exactly what the backend revoked -- if it hasn't,
    // a "successful" refresh here would silently resurrect the very
    // session that countdown exists to end, defeating it entirely. While
    // suppressExpiryHandling is set, take NO action at all (no refresh
    // attempt, no hard logout): just propagate the error as-is. The
    // countdown modal owns the real logout at zero regardless of what any
    // in-flight request does in the meantime.
    if (this.coreService.suppressExpiryHandling) {
      return throwError(() => err);
    }

    if (request.context.get(RETRIED_AFTER_REFRESH)) {
      return this.hardLogout(err);
    }

    return this.tokenLifecycle.refreshNow().pipe(
      switchMap((refreshed) => {
        if (!refreshed) {
          return this.hardLogout(err);
        }
        const freshToken = localStorage.getItem('token');
        const retried = request.clone({
          setHeaders: freshToken ? { Authorization: freshToken } : {},
          context: request.context.set(RETRIED_AFTER_REFRESH, true),
        });
        return next.handle(retried);
      }),
    );
  }

  /**
   * Unchanged from before this fix: force local logout, a single toast,
   * and a redirect to /signin -- now only reached once a silent refresh
   * has already been tried and genuinely failed (invalid/expired/revoked
   * refresh token, no refresh token for this session, or network failure),
   * i.e. this really is the last resort rather than the first response to
   * any expired token.
   */
  private hardLogout(err: HttpErrorResponse): Observable<never> {
    // SECURITY-LOGOUT-COUNTDOWN RACE FIX: while a
    // SecurityLogoutCountdownComponent is running (e.g. right after a
    // password change, which invalidates the token on the backend
    // immediately), this interceptor must not race it with its own
    // logout+toast+redirect -- the modal already owns a graceful, explained
    // logout at the end of its countdown. See CoreService.
    // suppressExpiryHandling for the full rationale.
    if (!this.handlingExpiry && !this.coreService.suppressExpiryHandling) {
      this.handlingExpiry = true;
      this.coreService.logout();
      this.snackbarService.error(`Your session has expired. Please sign in again to continue.`, '');
      // AUTH LIFECYCLE FIX: previously navigated to '/' (Home) here, on the
      // reasoning that an auto-detected expiry is "just like" an explicit
      // Sign Out. Per explicit product requirement, an expired session hit
      // on a protected route must land the user on the Sign-In FORM
      // directly, not the public homepage -- they were mid-task on a
      // protected page, not choosing to leave. logout() above already
      // clears local session state, so UnauthGuard on /signin renders it
      // normally (no stale "already logged in" redirect loop), and this
      // still tears down whatever protected route/module was mounted (e.g.
      // the employer portal), stopping any further now-doomed authenticated
      // calls the same as before.
      this.router.navigateByUrl('/signin');
    }
    return throwError(() => err);
  }
}
