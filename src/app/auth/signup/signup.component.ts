import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { mainAnimations } from '@main/shared/animations/main-animations';
import { AuthService } from '../auth.service';
import { AuthFacade } from '../state/auth.facade';
import * as Model from '../auth.model';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  animations: [mainAnimations]
})
export class SignupComponent implements OnInit {
  registerForm: FormGroup;
  message: any = localStorage.getItem('loginMessage');
  error: any = localStorage.getItem('loginError');
  inputType: string = 'password';
  submitting: boolean = false;
  pwPattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private authService: AuthService,
    private authFacade: AuthFacade
  ) { }

  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      email: [null, Validators.compose([Validators.required, Validators.email])],
      password: [null,
        Validators.compose([Validators.required, Validators.pattern(this.pwPattern)])],
      confirmPassword: [null, Validators.compose([Validators.required, Validators.minLength(8)])],
      firstName: [null, Validators.compose([Validators.required])],
      lastName: [null, Validators.compose([Validators.required])],
      agreeToTerms: [null, Validators.compose([Validators.required])],
      role: [null, Validators.compose([Validators.required])]
    },{ validator: this.checkIfMatchingPasswords('password', 'confirmPassword') });
  }

  register(event) {
    if(this.registerForm.valid) {
      let credentials: Model.Credentials = {
        email: this.registerForm.get('email').value,
        password: this.registerForm.get('password').value,
        firstName: this.registerForm.get('firstName').value,
        lastName: this.registerForm.get('lastName').value,
        role: this.registerForm.get('role').value,
      };

      this.authFacade.signUp(credentials);
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

  get pw_validators() {
    return this.registerForm.get('password');
  }

  get pw_reValidators() {
    return this.registerForm.get('confirmPassword');
  }

}
