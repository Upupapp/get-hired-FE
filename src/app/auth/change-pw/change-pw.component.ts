import { Component, OnInit } from '@angular/core';
import { AbstractControlOptions, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { mainAnimations } from '@main/shared/animations/main-animations';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-change-pw',
  templateUrl: './change-pw.component.html',
  styleUrls: ['./change-pw.component.scss'],
  animations: [mainAnimations],
})
export class ChangePwComponent implements OnInit {
  pwForm: FormGroup;
  pwPattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/;
  code: string;
  lang: string;
  role: string;
  email: string;
  error: string;
  message: string;
  loading: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    this.route.queryParams.subscribe(params => {
      this.code = params.oobCode;
      this.lang = params.lang
      this.role = params.role
      this.email = params.email
    });
  }

  ngOnInit(): void {
    this.pwForm = this.formBuilder.group({
      newPassword: ['', [Validators.required, Validators.pattern(this.pwPattern)]],
      confirmPassword: ['', [Validators.required, Validators.pattern(this.pwPattern)]],
    }, { validators: this.checkIfMatchingPasswords });
  }

  changePW() {
    this.loading = true;

    if (this.pwForm.valid) {
      this.authService.changePw(this.code, this.pwForm.controls.newPassword.value, this.email)
        .pipe(
          map((result: any) => {
            if (result?.data) {
              // TODO add alert
              localStorage.removeItem('loginError');
              this.message = "Change Password Successful. Redirecting to Login..."
              this.loading = false;
              this.redirectToLogin();

            }
          }),
          catchError((err: any) => {
            const { error } = err;
            localStorage.setItem('loginError', error.error);
            this.error = localStorage.getItem('loginError');
            // TODO add alert
            this.loading = false;

            return of(error);
          })
        ).subscribe();
    }
  }

  checkIfMatchingPasswords(passwordKey: string, passwordConfirmationKey: string) {
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

  redirectToLogin() {
    let url = "";

    switch (this.role) {
      case '1':
        url = "/admin/login";
        break;
      case '2':
        url = "/technician/login";
        break;
      case '3':
        url = "/user/login";
        break;
      default:
        url = "/selection";
        break;
    }

    this.onAlertClose();
    this.router.navigateByUrl(url);
  }

  // Clear error message
  onAlertClose(): void {
    localStorage.removeItem('loginError');
    this.error = undefined;
    this.message = undefined;
  }

  get pw_validators() {
    return this.pwForm.get('newPassword');
  }

  get pw_reValidators() {
    return this.pwForm.get('confirmPassword');
  }
}
