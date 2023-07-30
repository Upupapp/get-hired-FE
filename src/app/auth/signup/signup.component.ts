import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { mainAnimations } from '@main/shared/animations/main-animations';
import { AuthService } from '../auth.service';
import { AuthFacade } from '../state/auth.facade';
import * as Model from '../auth.model';
import { catchError, combineLatest, map, of, Subject, Subscription, takeUntil } from 'rxjs';
import { environment } from '@environments/environment';
import { ReCaptchaV3Service, RecaptchaErrorParameters } from "ng-recaptcha";

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
  siteKey = environment.recaptchaV2SiteKey;

  success$ = this.authFacade.getSuccess$;
  loading$ = this.authFacade.loading$;
  error$ = this.authFacade.error$
    .pipe().subscribe(this.showError.bind(this));

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private authService: AuthService,
    private authFacade: AuthFacade,
  ) { }

  ngOnInit(): void {
    // this.executeImportantAction();
    this.registerForm = this.formBuilder.group({
      email: [null, Validators.compose([Validators.required, Validators.email])],
      password: [null,
        Validators.compose([Validators.required, Validators.pattern(this.pwPattern)])],
      confirmPassword: [null, Validators.compose([Validators.required, Validators.minLength(8)])],
      firstName: [null, Validators.compose([Validators.required])],
      lastName: [null, Validators.compose([Validators.required])],
      agreeToTerms: [null, Validators.compose([Validators.required])],
      role: [null, Validators.compose([Validators.required])]
    }, { validator: this.checkIfMatchingPasswords('password', 'confirmPassword') });

    this.req$ = combineLatest([this.success$, this.loading$]).pipe(
      map(([success, loading]) => {
        if (success && !loading) {
          this.submitting = false;
          console.log('here meeee')
          this.openVerification(this.email);
        }
      }),
      catchError(err => {
        this.submitting = false;
        return of(err)
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

  openVerification(email: string) {
    this.router.navigate(['../verify'], { queryParams: { mode: 'registered' } })
    // if (email) {
    //   this.isResent = true;
    //   setTimeout(() => this.router.navigate(['../signin'], { relativeTo: this.activatedRoute }), 3000);
    // }
  }

  showError(err: any) {
    console.log(err);
    if (err) {
      this.submitting = false;
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

  resolved(captchaResponse: string): void {
    console.log(`Resolved captcha with response: ${captchaResponse}`);
  }

  onError(errorDetails): void {
    console.log(`reCAPTCHA error encountered; details:`, errorDetails);
  }

  // executeImportantAction(): void {
  //   this.recaptchaV3Service.execute('importantAction')
  //     .subscribe((token) => console.log(token));
  // }


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
