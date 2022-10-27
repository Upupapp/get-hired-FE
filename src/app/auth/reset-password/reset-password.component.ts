import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { mainAnimations } from '@main/shared/animations/main-animations';
import { map, catchError, of } from 'rxjs';
import { AuthService } from '../auth.service';

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
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.onAlertClose(); // Reset all errors
    this.pwForm = this.formBuilder.group({
      email: [null, Validators.compose([Validators.required, Validators.email])]
    });
  }

  ngOnDestroy(): void {
    localStorage.removeItem('loginError');
    localStorage.removeItem('loginMessage');
  }

  submitEmail(event: Event): void {
    this.email = this.pwForm?.get('email')?.value;
    this.loading = true;
    this.authService.getEmailPwLink(this.email)
      .pipe(
        map((result: any) => {
          if (result?.data) {
            // TODO add alert
            localStorage.removeItem('loginError');
            localStorage.removeItem('loginMessage');
            this.instructionSent = true;
            this.loading = false;

          }
        }),
        catchError((err: any) => {
          const { error } = err;
          localStorage.setItem('loginError', error.error);
          this.error = localStorage.getItem('loginError');
          this.loading = false;

          return of(err);
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
