import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  registerForm: FormGroup;
  message : any = localStorage.getItem('loginMessage');
  error : any = localStorage.getItem('loginError');
  inputType: string = 'password';
  submitting: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

  register(event) {

  }

  // Clear error message
  onAlertClose(): void {
    localStorage.removeItem('loginError');
    localStorage.removeItem('loginMessage');
    this.error   = undefined;
    this.message = undefined;
  }

}
