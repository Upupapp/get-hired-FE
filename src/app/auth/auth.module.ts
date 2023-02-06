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
import { ErrorNotFoundComponent } from '../views/error-page/error-not-found/error-not-found.component';
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
    SignupComponent,
    SigninComponent,
    ResetPasswordComponent,
    ChangePwComponent,
    AccountAuthenticationComponent,
    ErrorNotFoundComponent,
    AccountSettingComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    StoreModule.forFeature('status', authReducer),
    EffectsModule.forFeature([AuthEffects]),
    RouterModule.forChild(routes)
  ],
  providers: [AuthFacade],
  exports: [AccountSettingComponent]
})
export class AuthModule { }
