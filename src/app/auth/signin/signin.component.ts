import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { routes } from '@main/app.routing.module';
import { mainAnimations } from '@main/shared/animations/main-animations';
import { employerRoutes } from '@main/shared/guard/routes';
import { AuthFacade } from '../state/auth.facade';

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
    private authFacade: AuthFacade
  ) { }

  ngOnInit(): void {
    this.onAlertClose();

    this.loginForm = this.formBuilder.group({
      email: [null, Validators.compose([Validators.required, Validators.email])],
      password: [null, Validators.compose([Validators.required, Validators.minLength(8)])]
    });
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
      localStorage.setItem('user', JSON.stringify({
        _id: data.id,
        email: data.email,
        companyName: data.companyName
      }));

      if (this.loginForm) {
        this.loginForm.reset();
      }

      this.message = localStorage.getItem('loginMessage');
      console.log(user);
      switch(user.role) {
        case 1:
          this.router.navigate(['../admin'], { relativeTo: this.activatedRoute });
          break;
        case 2:
          this.router.resetConfig(employerRoutes);
          if (!user.withCompany) {
            console.log('cant');
            this.router.navigateByUrl('./company/settings');
          } else {
            this.router.navigate(['../dashboard'], { relativeTo: this.activatedRoute });
          }
          break;
        default:
          break;
      }
    }
  }

  showError(err: any) {
    if (err) {
      if (err == 'Please Verify Email with the link sent to your registered email address.') {
        this.error = 'Please Verify Email with the link sent to your registered email address.';
        this.verify = true;
      } else {
        this.error = localStorage.getItem('loginError');
      }
      this.submitting = false;
      window.scroll(0, 0);
    }
  }

  loginAdmin() {
    this.email = this.loginForm?.get('email')?.value;
    const password = this.loginForm?.get('password')?.value;
    this.submitting = true;

    this.authFacade.signIn(this.email, password);
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
}
