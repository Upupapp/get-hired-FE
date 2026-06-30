import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { mainAnimations } from '@main/shared/animations/main-animations';
import { AuthService } from '../auth.service';
import { AuthFacade } from '../state/auth.facade';
import * as Model from '../auth.model';
import { catchError, combineLatest, map, of, Subject, Subscription, takeUntil } from 'rxjs';
import { take } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { SeoService } from '@app-core/services/seo.service';
import { GoogleAuthService } from '../services/google-auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  animations: [mainAnimations]
})
export class SignupComponent implements OnInit {
  unsubscribe$ = new Subject<void>();
  req$: Subscription;

  registerForm: FormGroup;
  message: any = localStorage.getItem('loginMessage');
  error: any = localStorage.getItem('loginError');
  inputType: string = 'password';
  submitting: boolean = false;
  pwPattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/;
  email: string;
  isResent: boolean;
  siteKey = environment.recaptchaSiteKey;

  success$ = this.authFacade.getSuccess$;
  loading$ = this.authFacade.loading$;
  error$ = this.authFacade.error$
    .pipe().subscribe(this.showError.bind(this));

  googleLoading = false;
  googleError: string | null = null;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private authService: AuthService,
    private authFacade: AuthFacade,
    private seoService: SeoService,
    private googleAuthService: GoogleAuthService,
  ) { }

  ngOnInit(): void {
    // Clear stale signin errors — loginError is written by the signin flow and
    // should never bleed into the signup page's error state
    localStorage.removeItem('loginError');
    localStorage.removeItem('loginMessage');
    this.error = null;
    this.message = null;

    // SEO Phase 5 V4: signup is not a public indexable page — noindex + nofollow.
    // robots.txt already disallows /signup; this adds defense-in-depth at the
    // component level so Googlebot cannot mistake a JS-rendered page for indexable.
    this.seoService.setPageMeta({
      title: 'Create Account | GetHired Online',
      description: 'Create your GetHired Online account to start applying for jobs or posting vacancies in the Philippines.',
      robots: 'noindex, nofollow',
    });

    this.registerForm = this.formBuilder.group({
      email: [null, Validators.compose([Validators.required, Validators.email])],
      password: [null,
        Validators.compose([Validators.required, Validators.pattern(this.pwPattern)])],
      confirmPassword: [null, Validators.compose([Validators.required, Validators.minLength(8)])],
      firstName: [null, Validators.compose([Validators.required])],
      lastName: [null, Validators.compose([Validators.required])],
      agreeToTerms: [null, Validators.compose([Validators.required])],
      recaptcha: [null],
      role: [null, Validators.compose([Validators.required])]
    }, { validator: this.checkIfMatchingPasswords('password', 'confirmPassword') });

    // Public-portal CTAs can pre-select role via ?role=2|3 (e.g. "Continue
    // as Employer" -> /signup?role=2) so visitors don't have to pick it
    // again. Falls back to the existing required-field behavior if absent
    // or not one of the two valid values.
    const requestedRole = this.activatedRoute.snapshot.queryParamMap.get('role');
    if (requestedRole === '2' || requestedRole === '3') {
      this.registerForm.patchValue({ role: Number(requestedRole) });
    }

    this.req$ = combineLatest([this.success$, this.loading$]).pipe(
      map(([success, loading]) => {
        if (!loading) {
          // Always clear spinner when the store stops loading (success OR fail)
          this.submitting = false;
        }
        if (success && !loading) {
          this.openVerification(this.email);
        }
      }),
      catchError(err => {
        this.submitting = false;
        return of(err);
      })
    ).subscribe();
  }

  register(event) {
    if (this.registerForm.valid) {
      this.submitting = true;

      this.email = this.registerForm.get('email').value;
      let credentials: Model.Credentials = {
        email: this.registerForm.get('email').value,
        password: this.registerForm.get('password').value,
        firstName: this.registerForm.get('firstName').value,
        lastName: this.registerForm.get('lastName').value,
        role: this.registerForm.get('role').value,
      };

      this.authFacade.signUp(credentials);
    } else {
      this.submitting = false;
    }
  }

  onGoogleCredential(googleIdToken: string): void {
    if (this.googleLoading) return;
    this.googleLoading = true;
    this.googleError = null;

    this.googleAuthService.exchangeGoogleToken(googleIdToken)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.googleLoading = false;
          if (response.status === 'role_required') {
            this.googleAuthService.handleGoogleSessionResponse(response);
            this.router.navigate(['/auth/choose-role']);
          } else {
            const outcome = this.googleAuthService.handleGoogleSessionResponse(response);
            if (outcome === 'error') {
              this.googleError = response.message || 'Google sign-up failed. Please try again.';
            }
          }
        },
        error: (err) => {
          this.googleLoading = false;
          const body = err && err.error;
          this.googleError = (body && body.message) || 'Google sign-up did not complete. Try again or use email.';
        }
      });
  }

  onGoogleError(errorCode: string): void {
    if (errorCode === 'google_popup_closed' || errorCode === 'google_prompt_dismissed') return;
    this.googleError = 'Google sign-up did not complete. Try again or use email.';
  }

  openVerification(email: string) {
    this.router.navigate(['../verify'], { queryParams: { mode: 'registered' } })
    // if (email) {
    //   this.isResent = true;
    //   setTimeout(() => this.router.navigate(['../signin'], { relativeTo: this.activatedRoute }), 3000);
    // }
  }

  showError(err: any) {
    // Always clear spinner on error, even when payload is undefined/null
    this.submitting = false;
    if (err) {
      window.scroll(0, 0);
      this.error = err;
    }
  }

  checkIfMatchingPasswords(
    passwordKey: string,
    passwordConfirmationKey: string
  ) {
    return (group: FormGroup) => {
      const passwordInput = group.controls[passwordKey];
      const passwordConfirmationInput = group.controls[passwordConfirmationKey];
      if (passwordInput.value !== passwordConfirmationInput.value) {
        return passwordConfirmationInput.setErrors({ notEquivalent: true });
      } else {
        return passwordConfirmationInput.setErrors(null);
      }
    };
  }

  // Clear error message
  onAlertClose(): void {
    localStorage.removeItem('loginError');
    localStorage.removeItem('loginMessage');
    this.error = undefined;
    this.message = undefined;
  }

  get email_validators() {
    return this.registerForm.get('email');
  }

  get firstName_validators() {
    return this.registerForm.get('firstName');
  }

  get lastName_validators() {
    return this.registerForm.get('lastName');
  }

  get agreeToTerms_validators() {
    return this.registerForm.get('agreeToTerms');
  }

  get role_validators() {
    return this.registerForm.get('role');
  }

  get pw_validators() {
    return this.registerForm.get('password');
  }

  get pw_reValidators() {
    return this.registerForm.get('confirmPassword');
  }

  ngOnDestroy(): void {
    localStorage.removeItem('signupError');
    localStorage.removeItem('signupMessage');

    if (this.req$) this.req$.unsubscribe();

  }

}
