import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { catchError, finalize, map, of } from 'rxjs';
import { AuthService } from '../auth.service';
import { SeoService } from '@app-core/services/seo.service';

@Component({
  selector: 'app-account-authentication',
  templateUrl: './account-authentication.component.html',
  styleUrls: ['./account-authentication.component.scss'],
  animations: [mainAnimations]
})
export class AccountAuthenticationComponent implements OnInit {

  mode: string;
  code: string;
  continueUrl: string;
  lang: string;
  isVerified: boolean = false;
  role: string;
  email: string;
  loading: boolean = true;
  isResent: boolean;
  resendLinkForm: FormGroup;
  manual: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private seoService: SeoService,
  ) {
    this.route.queryParams.subscribe(params => {
      this.mode = params.mode;
      this.code = params.oobCode;
      this.continueUrl = params.continueUrl;
      this.lang = params.lang
      this.role = params.role
      this.email = params.email
      this.manual = params.manual
    });
  }

  ngOnInit(): void {
    // SEO Phase 5 V4: email verify is not a public indexable page.
    this.seoService.setPageMeta({
      title: 'Verify Account | GetHired Online',
      description: 'Verify your GetHired Online account email address.',
      robots: 'noindex, nofollow',
    });

    this.resendLinkForm = this.fb.group({
      'email': [this.email, [Validators.required, Validators.email]]
    });

    switch (this.mode) {
      case 'resendVerification':
        setTimeout(() => this.resendVerification(), 3000);
        break;
      case 'resetPassword':
        setTimeout(() => this.router.navigate(['../change-password'],
        { relativeTo: this.route, queryParams: { role: this.role, oobCode: this.code, email: this.email } }), 3000);
        break;
      case 'recoverEmail':
        // TODO: implement email recovery flow
        break;
      case 'verifyEmail':
        setTimeout(() => this.verifyEmail(), 3000);
        break;
      case 'registered':
        this.loading = false;
        this.isResent = true;
        break;
      default:
        break;
    }
  }

  verifyEmail() {
    this.authService.verifyEmailLink(this.code)
      .pipe(
        map((result: any) => {
          this.loading = false;
          if (result?.data) {
            this.isVerified = true;
            localStorage.removeItem('loginError');
          }
        }),
        catchError((err: any) => {
          this.loading = false;
          return of(err);
        }),
        finalize(() => {
          // if(this.manual) {
          //   setTimeout(() => {
          //     window.self.close(), 3000
          //   });
          // }
        })
      ).subscribe();
  }

  resendVerification() {
    const userEmail = this.email ? this.email:this.resendLinkForm.controls.email.value;
    this.authService.resendVerification(userEmail)
      .pipe(
        map((result: any) => {
          this.loading = false;
          if (result?.data) {
            this.isResent = true;
            localStorage.removeItem('loginError');
            localStorage.removeItem('loginMessage');
            // NOTIFY QA11: fixed typo "send" → "sent"; clearer phrasing
            this.snackBar.open(`Verification email sent. Please check your inbox and verify your account.`,
              '', { duration: 4000, panelClass: ['success-snackbar'] });
            setTimeout(() => this.redirectToLogin(), 3000);
          }
        }),
        catchError((err: any) => {
          this.isResent = false;
          this.loading = false;
          this.snackBar.open(err,
              '', { duration: 4000, panelClass: ['danger-snackbar'] });
          return of(err);
        })
      ).subscribe();
  }

  redirectToLogin() {
    this.router.navigate(['../signin']);
  }

  get email_validators() {
    return this.resendLinkForm.get('email');
  }
}
