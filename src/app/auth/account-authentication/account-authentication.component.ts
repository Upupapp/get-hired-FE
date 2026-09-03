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
  // BUGFIX (bare /verify dead-end): the switch below has no case for a
  // missing/unrecognized `mode` -- previously fell through to `default:
  // break;`, which never touched `loading` (initialized true above), so
  // the page rendered <app-loading> forever. This is a real, observed
  // entry point (link-scanner prefetch, an email client stripping query
  // params, a bookmarked/re-visited URL, etc.) -- handleCodeInApp:true is
  // already set on both action-link generators (get-hired-BE
  // helpers/firebaseFunctions.js), so a genuine email-link click always
  // carries mode+oobCode and never reaches this state. Deliberately a
  // third, distinct state from both `isVerified` (would be fabricating
  // success with no evidence) and the alarming "Error Verifying your
  // account" `errorSent` template (implies a real failure that didn't
  // necessarily happen) -- truthful "can't confirm from here" copy with
  // real Sign In / Resend navigation, per the recovery-state requirement.
  unknownState: boolean = false;
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
        // No recognized mode (including a completely bare /verify) -- stop
        // loading and show the honest recovery state instead of hanging.
        // Never sets isVerified here: that would assert success this
        // component has no actual evidence for.
        this.loading = false;
        this.unknownState = true;
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
            // Local-dev-only guidance, never shown in production. Left
            // deliberately general rather than naming one specific cause:
            // the backend collapses every failure in this path into the
            // same generic 500 (see get-hired-BE/notes.md), so the frontend
            // has no reliable way to tell which of the known local causes
            // actually happened -- (a) the Firebase Auth Emulator no longer
            // has this account (its data is in-memory and does not survive
            // a restart unless it was started with --import/--export-on-exit
            // -- see scripts/verify-local-user.js's header for the
            // canonical local startup command), or (b) a confirmed backend
            // case-sensitivity bug where the account was actually created
            // successfully but this specific step crashed regardless of
            // emulator state (also in notes.md). Retry rarely helps either
            // way; the verify-local-user helper is the reliable path.
            this.snackbarService.warning(
              'Local dev: run "npm run verify-local-user -- <email>" from get-hired-FE — it completes verification directly against the local Firebase emulator and reports the exact reason if it can’t (account missing from the emulator, already verified, etc).',
              '', 10000
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
