import { NgModule, APP_INITIALIZER } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignupComponent } from './signup/signup.component';
import { SigninComponent } from './signin/signin.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from '@app-shared/shared.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AuthEffects } from './state/auth.effects';
import { authReducer } from './state/auth.reducer';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { ChangePwComponent } from './change-pw/change-pw.component';
import { AccountAuthenticationComponent } from './account-authentication/account-authentication.component';
import { AuthFacade } from './state/auth.facade';
import { AccountSettingComponent } from './account-setting/account-setting.component';
import { UnauthGuard } from '@app-shared/guard/unauth.guard';
import { RoleClassificationComponent } from './role-classification/role-classification.component';
import { environment } from '@environments/environment';

// Expose Google OAuth client ID as a window property for the GIS button component.
// This runs synchronously at module load — no async required.
function provideGoogleClientId() {
  return () => {
    if (typeof window !== 'undefined') {
      (window as any).__GH_GOOGLE_CLIENT_ID__ = environment.googleClientId;
    }
  };
}

const routes: Routes = [
  {
    path: 'signin', component: SigninComponent,
    canActivate: [UnauthGuard],
  },
  { path: 'signup', component: SignupComponent, canActivate: [UnauthGuard] },
  { path: 'reset-password', component: ResetPasswordComponent, canActivate: [UnauthGuard] },
  { path: 'change-password', component: ChangePwComponent, canActivate: [UnauthGuard] },
  { path: 'verify', component: AccountAuthenticationComponent, canActivate: [UnauthGuard] },
  // Role classification page — shown after Google sign-in for new users
  // No UnauthGuard here: Google-authed user has no GetHired session yet
  { path: 'choose-role', component: RoleClassificationComponent },
];

@NgModule({
  declarations: [
    SignupComponent,
    SigninComponent,
    ResetPasswordComponent,
    ChangePwComponent,
    AccountAuthenticationComponent,
    AccountSettingComponent,
    RoleClassificationComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    StoreModule.forFeature('status', authReducer),
    EffectsModule.forFeature([AuthEffects]),
    RouterModule.forChild(routes)
  ],
  providers: [
    AuthFacade,
    {
      provide: APP_INITIALIZER,
      useFactory: provideGoogleClientId,
      multi: true
    }
  ],
  exports: [AccountSettingComponent]
})
export class AuthModule { }
