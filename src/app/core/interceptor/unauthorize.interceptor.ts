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
  constructor(private router: Router,
    private coreService: CoreService,
    private snackbarService: SnackbarService
  ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(tap(() => { },
      (err: any) => {
        if (err instanceof HttpErrorResponse) {
          // localStorage.setItem('returnURL', this.router.url);

          if (err.status === 401 || err.status === 403) {
            // Both 401 (unauthenticated) and 403 (forbidden/expired token) should
            // redirect to sign-in. Previously only 403 was caught -- a 401 from
            // a truly expired session would silently show API errors with no
            // guidance to re-authenticate.
            this.coreService.logout();
            this.snackbarService.error(`Your session has expired. Please sign in again to continue.`, '');
            this.router.navigateByUrl('/signin');
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
