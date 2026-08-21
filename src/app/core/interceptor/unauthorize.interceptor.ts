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

          if (err.status === 401 || err.status === 403) {
            // Both 401 (unauthenticated) and 403 (forbidden/expired token) should
            // sign the user out. Previously only 403 was caught -- a 401 from
            // a truly expired session would silently show API errors with no
            // guidance to re-authenticate.
            //
            // GUEST FIX (2026-08-19): a 401/403 only means "your session expired"
            // for someone who HAD a local session to begin with. A true first-time
            // guest (isLoggedIn() false -- no local session state at all) calling
            // a request the app itself never expected to require auth (e.g. the
            // anonymous AI job-preview generate call) would otherwise be told
            // their session "expired" and get force-redirected away, even
            // though they were never signed in -- a misleading error and a lost
            // in-progress action. For a true guest, skip the logout/redirect/toast
            // entirely and let the error propagate to the calling component's own
            // handler, which is better positioned to show an accurate, contextual
            // message. Authenticated-then-expired behavior is unchanged.
            if (this.coreService.isLoggedIn() && !this.handlingExpiry) {
              this.handlingExpiry = true;
              this.coreService.logout();
              this.snackbarService.error(`Your session has expired. Please sign in again to continue.`, '');
              // An auto-detected expiry is functionally a sign-out the user
              // didn't ask for -- land exactly where an explicit Sign Out
              // does (Home), never on /signin. /signin has its own guard
              // logic that has no reason to run mid-expiry-handling, and a
              // stale in-flight route (e.g. the employer portal) must not
              // stay mounted re-firing more now-doomed authenticated calls.
              this.router.navigateByUrl('/');
            }
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
