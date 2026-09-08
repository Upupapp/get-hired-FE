import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { mainAnimations } from '@main/shared/animations/main-animations';
import { map, catchError, of } from 'rxjs';
import { AuthService } from '../auth.service';
import { SeoService } from '@app-core/services/seo.service';
import { focusFirstInvalidControl } from '@app-shared/utils/form-validation.util';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  animations: [mainAnimations]
})
export class ResetPasswordComponent implements OnInit {

  pwForm: FormGroup;
  loading = false;
  email: string;
  message: any = localStorage.getItem('loginMessage');
  error: any = localStorage.getItem('loginError');
  inputType: string = 'password';

  instructionSent: boolean = false;
  isVerified: boolean = false;


  constructor(private router: Router,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private seoService: SeoService,
  ) { }

  ngOnInit(): void {
    // SEO Phase 5 V4: reset-password is not a public indexable page.
    this.seoService.setPageMeta({
      title: 'Reset Password | GetHired Online',
      description: 'Reset your GetHired Online account password.',
      robots: 'noindex, nofollow',
    });

    this.onAlertClose(); // Reset all errors
    this.pwForm = this.formBuilder.group({
      email: [null, Validators.compose([Validators.required, Validators.email, Validators.maxLength(254)])]
    });
  }

  ngOnDestroy(): void {
    localStorage.removeItem('loginError');
    localStorage.removeItem('loginMessage');
  }

  submitEmail(event: Event): void {
    // BUGFIX (QA JS-19/20, P1 -- true root cause): the template binds plain
    // (submit), not (ngSubmit), which never preventDefault()s on its own --
    // submitting with Enter triggered a real browser page
    // navigation/reload before any of the code below ever ran, silently
    // discarding whatever was typed. This also had NO validity check at
    // all: an empty/invalid submit that did reach this code sent the
    // request anyway with an empty/malformed email.
    if (event && typeof event.preventDefault === 'function') {
      event.preventDefault();
    }

    if (this.pwForm.invalid) {
      focusFirstInvalidControl(this.pwForm);
      return;
    }

    if (this.loading) {
      // Guards against a rapid double-click/double-Enter firing a second
      // request while the first is still in flight -- the button is
      // already [disabled]="loading" for the same reason, but this covers
      // the (submit) handler being invoked directly.
      return;
    }

    this.email = this.pwForm?.get('email')?.value;
    this.loading = true;
    this.authService.getEmailPwLink(this.email)
      .pipe(
        map(() => {
          // BUGFIX (account enumeration): the backend's /auth/getpwresetlink
          // already always responds 200 with one generic message regardless
          // of whether the account exists (see passwordResetLink in
          // userController.js), so the success branch never needs to -- and
          // must not -- inspect the response body for anything
          // existence-revealing. Show the same confirmation state
          // unconditionally on any successful HTTP response.
          localStorage.removeItem('loginError');
          localStorage.removeItem('loginMessage');
          this.instructionSent = true;
          this.loading = false;
        }),
        catchError(() => {
          // BUGFIX (account enumeration): this previously surfaced the raw
          // backend/Firebase error text verbatim (e.g. "auth/user-not-found"
          // or similar), which is exactly the enumeration signal the
          // generic success response above is designed to avoid -- a
          // network/5xx failure must show only a generic, non-revealing
          // system-error message, never the underlying error body.
          this.error = "We couldn't process your request right now. Please try again.";
          this.loading = false;

          return of(null);
        })
      ).subscribe();
  }

  redirectToLogin() {
    this.router.navigate(['../signin'], { relativeTo: this.activatedRoute });
  }
  // Clear error message
  onAlertClose(): void {
    localStorage.removeItem('loginError');
    localStorage.removeItem('loginMessage');
    this.error = undefined;
    this.message = undefined;
  }
}
