import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SnackbarService } from '@app-core/services/snackbar.service';
import { ActivatedRoute, Router } from '@angular/router';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { catchError, finalize, map, of } from 'rxjs';
import { AuthService } from '../auth.service';
import { SeoService } from '@app-core/services/seo.service';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-account-authentication',
  templateUrl: './account-authentication.component.html',
  styleUrls: ['./account-authentication.component.scss'],
  animations: [mainAnimations]
})
export class AccountAuthenticationComponent implements OnInit {

  mode: string;
  code: string;
  continueUrl: string;
  lang: string;
  isVerified: boolean = false;
  role: string;
  email: string;
  loading: boolean = true;
  isResent: boolean;
  resendLinkForm: FormGroup;
  manual: boolean = false;
  // GETHIRED_LOCAL_ACCOUNT_VERIFICATION_500_REMEDIATION_SINGLE_COMMAND_V1:
  // in-flight guard -- the resend button previously fired resendVerification()
  // from BOTH (click) and the form's (ngSubmit) (a bare <button> inside a
  // <form> defaults to type="submit"), so one click produced two overlapping
  // requests, on top of the automatic setTimeout() call in ngOnInit. This
  // flag disables the button while a request is in flight and is checked at
  // the top of resendVerification() as defense-in-depth.
  resending: boolean = false;
  // Not production === local/staging dev build (environment.production is
  // false only outside the production fileReplacement) -- used only to show
  // additional local-testing guidance text, never to change verification
  // enforcement or bypass anything.
  isNonProductionBuild: boolean = !environment.production;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private snackbarService: SnackbarService,
    private fb: FormBuilder,
    private seoService: SeoService,
  ) {
    this.route.queryParams.subscribe(params => {
      this.mode = params.mode;
      this.code = params.oobCode;
      this.continueUrl = params.continueUrl;
      this.lang = params.lang
      this.role = params.role
      this.email = params.email
      this.manual = params.manual
    });
  }

  ngOnInit(): void {
    // SEO Phase 5 V4: email verify is not a public indexable page.
    this.seoService.setPageMeta({
      title: 'Verify Account | GetHired Online',
      description: 'Verify your GetHired Online account email address.',
      robots: 'noindex, nofollow',
    });

    this.resendLinkForm = this.fb.group({
      'email': [this.email, [Validators.required, Validators.email]]
    });

    switch (this.mode) {
      case 'resendVerification':
        setTimeout(() => this.resendVerification(), 3000);
        break;
      case 'resetPassword':
        setTimeout(() => this.router.navigate(['../change-password'],
        { relativeTo: this.route, queryParams: { role: this.role, oobCode: this.code, email: this.email } }), 3000);
        break;
      case 'recoverEmail':
        // TODO: implement email recovery flow
        break;
      case 'verifyEmail':
        setTimeout(() => this.verifyEmail(), 3000);
        break;
      case 'registered':
        this.loading = false;
        this.isResent = true;
        break;
      default:
        break;
    }
  }

  verifyEmail() {
    this.authService.verifyEmailLink(this.code)
      .pipe(
        map((result: any) => {
          this.loading = false;
          if (result?.data) {
            this.isVerified = true;
            localStorage.removeItem('loginError');
          }
        }),
        catchError((err: any) => {
          this.loading = false;
          return of(err);
        }),
        finalize(() => {
          // if(this.manual) {
          //   setTimeout(() => {
          //     window.self.close(), 3000
          //   });
          // }
        })
      ).subscribe();
  }

  resendVerification() {
    // In-flight guard: the automatic setTimeout() call in ngOnInit and a
    // manual click/submit could otherwise overlap.
    if (this.resending) { return; }

    const userEmail = this.email ? this.email:this.resendLinkForm.controls.email.value;
    this.resending = true;
    this.authService.resendVerification(userEmail)
      .pipe(
        map((result: any) => {
          this.loading = false;
          this.resending = false;
          if (result?.data) {
            this.isResent = true;
            localStorage.removeItem('loginError');
            localStorage.removeItem('loginMessage');
            // NOTIFY QA11: fixed typo "send" → "sent"; clearer phrasing
            this.snackbarService.success(`Verification email sent. Please check your inbox and verify your account.`, '');
            setTimeout(() => this.redirectToLogin(), 3000);
          }
        }),
        catchError((err: any) => {
          this.isResent = false;
          this.loading = false;
          this.resending = false;
          // BUG FIX: err is the raw HttpErrorResponse -- passing it directly
          // to the snackbar rendered a garbled object, not a message. The
          // backend's error envelope is always { status: "error", error: <string> }
          // (see get-hired-BE/helpers/status.js errorResponse()).
          const backendMessage: string | undefined = err && err.error && err.error.error;
          const message = backendMessage
            || 'We couldn’t send the verification link. Please try again in a moment.';
          this.snackbarService.error(message, '');
          if (this.isNonProductionBuild) {
            // Local-dev-only guidance, never shown in production. The most
            // common local cause is a Firebase Auth Emulator that no longer
            // has this account (its data is in-memory and is lost on every
            // emulator/backend restart, even though the Postgres row
            // persists) -- retrying alone will not fix that; the account
            // needs to be re-registered against the currently-running
            // emulator. See get-hired-BE/notes.md for the backend-side gap
            // (this failure mode and unrelated ones all collapse into the
            // same generic 500 today).
            this.snackbarService.warning(
              'Local dev: if this account was registered before the Firebase Auth Emulator was last restarted, it no longer exists there. Register again against the currently running emulator.',
              '', 8000
            );
          }
          return of(err);
        })
      ).subscribe();
  }

  redirectToLogin() {
    this.router.navigate(['../signin']);
  }

  get email_validators() {
    return this.resendLinkForm.get('email');
  }
}
