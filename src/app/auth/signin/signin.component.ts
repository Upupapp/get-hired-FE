import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { routes } from '@main/app.routing.module';
import { mainAnimations } from '@main/shared/animations/main-animations';
import { employerRoutes } from '@main/shared/guard/routes';
import { AuthFacade } from '../state/auth.facade';
import { TranslateService } from '@ngx-translate/core';
import { SeoService } from '@app-core/services/seo.service';

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
  ) { }

  ngOnInit(): void {
    // SEO Phase 5: sign-in is not a public indexable page
    this.seoService.setPageMeta({
      title: 'Sign In | GetHired Online',
      description: 'Sign in to your GetHired Online account to access your dashboard, manage applications, and continue your job search.',
      robots: 'noindex, nofollow',
    });
    this.onAlertClose();

    this.loginForm = this.formBuilder.group({
      email: [null, Validators.compose([Validators.required, Validators.email])],
      password: [null, Validators.compose([Validators.required, Validators.minLength(8)])]
    });
  }

  loggedIn(user) {
    if (user && user.id) {
      console.log('dapat di na');
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
      console.log(user);
      switch (user.role) {
        case 1:
          localStorage.setItem('user', JSON.stringify({
            _id: data.id,
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName
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
            lastName: data.lastName
          }));

          const redirect = localStorage.getItem('returnURL');
          console.log(redirect);
          if (redirect) {
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
