import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { mainAnimations } from '@main/shared/animations/main-animations';

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
  message : any = localStorage.getItem('loginMessage');
  error : any = localStorage.getItem('loginError');

  constructor(
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email: [null, Validators.compose([Validators.required, Validators.email])],
      password: [null, Validators.compose([Validators.required, Validators.minLength(8)])]
    });
  }

  loginAdmin() {

  }

  // Clear error message
  onAlertClose(): void {
    localStorage.removeItem('loginError');
    localStorage.removeItem('loginMessage');
    this.error   = undefined;
    this.message = undefined;
  }
}
