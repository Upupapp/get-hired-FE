import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CommonModule } from '@angular/common';
import { SharedModule } from '@app-shared/shared.module';
import { SigninComponent } from './signin/signin.component';

import { SignupComponent } from './signup/signup.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { authReducer } from './state/auth.reducer';
import { AuthEffects } from './state/auth.effects';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { ChangePwComponent } from './change-pw/change-pw.component';
import { AccountAuthenticationComponent } from './account-authentication/account-authentication.component';
import { AuthFacade } from './state/auth.facade';
import { AccountSettingComponent } from './account-setting/account-setting.component';

const routes: Routes = [
  {
    path: 'signin', component: SigninComponent,
    data: {
      isMobileViewAllowed: true
    }
  },
  { path: 'signup', component: SignupComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'change-password', component: ChangePwComponent },
  { path: 'verify', component: AccountAuthenticationComponent },
  { path: '', redirectTo: 'signin', pathMatch: 'full' },
];

@NgModule({
  declarations: [
    SigninComponent,
    SignupComponent,
    ResetPasswordComponent,
    ChangePwComponent,
    AccountAuthenticationComponent,
    AccountSettingComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    StoreModule.forFeature('status', authReducer),
    EffectsModule.forFeature([AuthEffects]),
    RouterModule.forChild(routes)
  ],
  providers: [AuthFacade],
  exports: [AccountSettingComponent]
})
export class AuthModule { }
