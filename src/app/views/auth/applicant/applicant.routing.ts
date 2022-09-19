import { Routes } from '@angular/router';
import { ApplicantSigninComponent } from './applicant-signin/applicant-signin.component';
import { ApplicantSignupComponent } from './applicant-signup/applicant-signup.component';
import { ApplicantProfileComponent } from './applicant-profile/applicant-profile.component';
import { AdminGuard } from '../../../shared/guard/auth/admin.guard';
import { ApplicantForgotPasswordComponent } from './applicant-forgot-password/applicant-forgot-password.component';

export const ApplicantsRoutes: Routes = [
  { 
    path: 'forgot-password',
    component: ApplicantForgotPasswordComponent
  },
  { 
    path: 'signin',
    component: ApplicantSigninComponent
  },
  { 
    path: 'signup', 
    component: ApplicantSignupComponent 
  },
  { 
    path: 'profile', 
    component: ApplicantProfileComponent,
    canActivate: [AdminGuard]
  },
];
