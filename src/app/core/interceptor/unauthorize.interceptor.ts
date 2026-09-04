import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler, HttpInterceptor, HttpRequest
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { tap } from "rxjs";
import { SnackbarService } from '../services/snackbar.service';
import { CoreService } from "../services/core.service";

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
  private handlingExpiry = false;

  constructor(private router: Router,
    private coreService: CoreService,
    private snackbarService: SnackbarService
  ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(tap(() => {
      // Self-clearing: any request that comes back successfully while
      // logged in proves the session is currently fine (e.g. a fresh
      // sign-in's own calls), so the dedupe flag shouldn't keep suppressing
      // handling of a LATER, genuinely new expiry.
      if (this.handlingExpiry && this.coreService.isLoggedIn()) {
        this.handlingExpiry = false;
      }
    },
      (err: any) => {
        if (err instanceof HttpErrorResponse) {
          // localStorage.setItem('returnURL', this.router.url);

          if (err.status === 401) {
            // BUGFIX (2026-08-27): the backend's own auth-semantics fix
            // (get-hired-BE controllers/middleware, "TAB 12 remediation")
            // made 401 mean ONLY "not authenticated" (missing/invalid/
            // expired token, verifyAuth) and 403 mean ONLY "authenticated,
            // but denied for this specific resource/role/permission"
            // (verifyRoles + the ~20 ownership/BOLA/subscription-limit
            // checks throughout controllers/*) -- 403 no longer implies a
            // dead session at all. This interceptor still treated every
            // 403 as a session expiry and force-logged the user out, which
            // is exactly the collision that backend fix was written to
            // eliminate on this side too. A perfectly valid, signed-in
            // employer or job seeker hitting any ordinary permission
            // denial (wrong company on a job, no active subscription, role
            // mismatch) was being silently signed out and redirected to
            // /signin with "Your session has expired" -- across both
            // portals, on routine, correctly-denied requests.
            //
            // GUEST FIX (2026-08-19): a 401 only means "your session
            // expired" for someone who HAD a local session to begin with.
            // A true first-time guest (isLoggedIn() false -- no local
            // session state at all) calling a request the app itself never
            // expected to require auth (e.g. the anonymous AI job-preview
            // generate call) would otherwise be told their session
            // "expired" and get force-redirected away, even though they
            // were never signed in -- a misleading error and a lost
            // in-progress action. For a true guest, skip the logout/
            // redirect/toast entirely and let the error propagate to the
            // calling component's own handler, which is better positioned
            // to show an accurate, contextual message.
            // SECURITY-LOGOUT-COUNTDOWN RACE FIX: while a
            // SecurityLogoutCountdownComponent is running (e.g. right after
            // a password change, which invalidates the token on the
            // backend immediately), this interceptor must not race it with
            // its own logout+toast+redirect -- the modal already owns a
            // graceful, explained logout at the end of its countdown. See
            // CoreService.suppressExpiryHandling for the full rationale.
            if (this.coreService.isLoggedIn() && !this.handlingExpiry && !this.coreService.suppressExpiryHandling) {
              this.handlingExpiry = true;
              this.coreService.logout();
              this.snackbarService.error(`Your session has expired. Please sign in again to continue.`, '');
              // AUTH LIFECYCLE FIX: previously navigated to '/' (Home) here,
              // on the reasoning that an auto-detected expiry is "just like"
              // an explicit Sign Out. Per explicit product requirement, an
              // expired session hit on a protected route must land the user
              // on the Sign-In FORM directly, not the public homepage --
              // they were mid-task on a protected page, not choosing to
              // leave. logout() above already clears local session state,
              // so UnauthGuard on /signin renders it normally (no stale
              // "already logged in" redirect loop), and this still tears
              // down whatever protected route/module was mounted (e.g. the
              // employer portal), stopping any further now-doomed
              // authenticated calls the same as before.
              this.router.navigateByUrl('/signin');
            }
          } else if (err.status === 403) {
            // Authenticated but denied -- not a dead session. Surface the
            // backend's own message when it sent a real, user-safe one;
            // otherwise a generic permission-denied notice. Never logs out
            // or redirects -- the calling component/effect still gets the
            // error and can react (e.g. an inline "not allowed" state)
            // exactly as it already does for any other non-2xx response.
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
        }
        else {
          return;
        }
      }));
  }
}
