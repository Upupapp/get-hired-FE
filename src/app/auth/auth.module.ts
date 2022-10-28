import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignupComponent } from './signup/signup.component';
import { SigninComponent } from './signin/signin.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from '@app-shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthEffects } from './state/auth.effects';
import { authReducer } from './state/auth.reducer';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { ChangePwComponent } from './change-pw/change-pw.component';
import { AccountAuthenticationComponent } from './account-authentication/account-authentication.component';

const routes: Routes = [
  { path: 'signin', component: SigninComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'change-password', component: ChangePwComponent },
  { path: 'verify', component: AccountAuthenticationComponent },
  { path: '', redirectTo: 'signin', pathMatch: 'full' }
];

@NgModule({
  declarations: [
    SignupComponent,
    SigninComponent,
    ResetPasswordComponent,
    ChangePwComponent,
    AccountAuthenticationComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    StoreModule.forFeature('status', authReducer),
    EffectsModule.forFeature([AuthEffects]),
    RouterModule.forChild(routes)
  ]
})
export class AuthModule { }
