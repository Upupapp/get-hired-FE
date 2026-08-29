import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { routes } from '@main/app.routing.module';
import { mainAnimations } from '@main/shared/animations/main-animations';
import { employerRoutes } from '@main/shared/guard/routes';
import { AuthFacade } from '../state/auth.facade';
import { TranslateService } from '@ngx-translate/core';
import { SeoService } from '@app-core/services/seo.service';
import { GoogleAuthService } from '../services/google-auth.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss'],
  animations: [mainAnimations],
})
export class SigninComponent implements OnInit {
  loginForm: FormGroup;
  inputType: string = 'password';
  submitting: boolean = false;
  message: any = localStorage.getItem('loginMessage');
  error: any = localStorage.getItem('loginError');
  verify: boolean;
  email: string;
  googleLoading = false;
  googleError: string | null = null;

  credentials$ = this.authFacade.credentials$
    .pipe().subscribe(
      this.loggedIn.bind(this));

  error$ = this.authFacade.error$
    .pipe().subscribe(this.showError.bind(this));

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private authFacade: AuthFacade,
    private seoService: SeoService,
    private googleAuthService: GoogleAuthService,
  ) { }

  ngOnInit(): void {
    // SEO Phase 5: sign-in is not a public indexable page
    this.seoService.setPageMeta({
      title: 'Sign In | GetHired Online',
      description: 'Sign in to your GetHired Online account to access your dashboard, manage applications, and continue your job search.',
      robots: 'noindex, nofollow',
    });
    this.onAlertClose();

    const rememberedEmail = localStorage.getItem('rememberedEmail');

    this.loginForm = this.formBuilder.group({
      email: [rememberedEmail || null, Validators.compose([Validators.required, Validators.email])],
      password: [null, Validators.compose([Validators.required, Validators.minLength(8)])],
      rememberMe: [!!rememberedEmail]
    });
  }

  togglePasswordVisibility(): void {
    this.inputType = this.inputType === 'password' ? 'text' : 'password';
  }

  loggedIn(user) {
    if (user && user.id) {
      this.submitting = false;

      let data = user;

      localStorage.removeItem('loginError');
      localStorage.setItem('state', 'true');
      localStorage.setItem('role', user.role);
      localStorage.setItem('loginMessage', 'Login was successful.');
      localStorage.setItem('token', 'Bearer ' + data.token);
      localStorage.setItem('token_authorization', data.token.replace('Bearer ', ''));
      localStorage.setItem('refreshToken', data.refreshToken);

      if (this.loginForm) {
        this.loginForm.reset();
      }

      this.message = localStorage.getItem('loginMessage');
      switch (user.role) {
        case 1:
          localStorage.setItem('user', JSON.stringify({
            _id: data.id,
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            photoUrl: data.photoUrl
          }));
          this.router.navigate(['../admin'], { relativeTo: this.activatedRoute });
          break;
        case 2:
          localStorage.setItem('user', JSON.stringify({
            _id: data.id,
            email: data.email,
            companyId: data.companyId,
            companyName: data.companyName,
            firstName: data.firstName,
            lastName: data.lastName,
            photoUrl: data.photoUrl

          }));

          if (user.withCompany) {

            if(user.withActiveSubscription) {
              localStorage.setItem('withActiveSubscription', data.withActiveSubscription);
              this.router.navigate(['../recruiter/dashboard'], { relativeTo: this.activatedRoute });
            } else {
              this.router.navigate(['../recruiter/subscription'], { relativeTo: this.activatedRoute });
            }

          } else {
            this.router.navigate(['../recruiter/company'], { relativeTo: this.activatedRoute });
          }
          break;
        case 3:
          localStorage.setItem('user', JSON.stringify({
            _id: data.id,
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            photoUrl: data.photoUrl
          }));

          const redirect = localStorage.getItem('returnURL');
          if (redirect) {
            // PROFILE-SETUP PHASE 1 FIX: consumed once -- was previously
            // read but never cleared, leaving it to silently redirect a
            // later, unrelated sign-in to a stale job/page.
            localStorage.removeItem('returnURL');
            this.router.navigateByUrl(redirect);
          } else {
            this.router.navigate(['/user/dashboard'], { relativeTo: this.activatedRoute });
          }
          break;
        default:
          break;
      }
    }
  }

  showError(err: any) {
    if (err) {
      // NOTIFY QA11: normalised copy — lowercase "verify your email", clearer instruction
      if (err == 'Please Verify Email with the link sent to your registered email address.') {
        this.error = 'Please verify your email address. Check your inbox for the verification link we sent.';
        this.verify = true;
      } else {
        this.error = localStorage.getItem('loginError');
      }
      this.submitting = false;
      window.scroll(0, 0);
    }
  }

  loginAdmin() {
    // localStorage.clear();
    this.email = this.loginForm?.get('email')?.value;
    const password = this.loginForm?.get('password')?.value;
    this.submitting = true;

    // "Remember me" persistence: only the email is retained locally (never the
    // password/token) so the field can be prefilled on return -- no real
    // extended-session/"stay signed in" behavior is implemented on the backend.
    if (this.loginForm?.get('rememberMe')?.value) {
      localStorage.setItem('rememberedEmail', this.email.toLowerCase());
    } else {
      localStorage.removeItem('rememberedEmail');
    }

    this.authFacade.signIn(this.email.toLowerCase(), password);
  }

  resendVerification() {
    // TODO
    this.onAlertClose();
    const url = '../verify';
    this.router.navigate([url], {
      relativeTo: this.activatedRoute, queryParams: {
        role: 1,
        mode: 'resendVerification',
        email: this.email
      }
    });
  }

  // Handle Google credential from GIS button
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
            this.router.navigate(['/choose-role']);
          } else {
            const outcome = this.googleAuthService.handleGoogleSessionResponse(response);
            if (outcome === 'error') {
              this.googleError = response.message || 'Google sign-in failed. Please try again.';
            }
          }
        },
        error: (err) => {
          this.googleLoading = false;
          const body = err && err.error;
          this.googleError = (body && body.message) || 'Google sign-in did not complete. Try again or use email.';
        }
      });
  }

  onGoogleError(errorCode: string): void {
    if (errorCode === 'google_popup_closed' || errorCode === 'google_prompt_dismissed') return;
    this.googleError = 'Google sign-in did not complete. Try again or use email.';
  }

  // Clear error message
  onAlertClose(): void {
    localStorage.removeItem('loginError');
    localStorage.removeItem('loginMessage');
    this.error = undefined;
    this.message = undefined;
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if (this.credentials$) {
      this.credentials$.unsubscribe();
    }
  }
}
