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
import { AuthFacade } from './state/auth.facade';
import { AccountSettingComponent } from './account-setting/account-setting.component';
import { UnauthGuard } from '@app-shared/guard/unauth.guard';

const routes: Routes = [
  {
    // canActivate moved here from the lazy-module mount point in
    // app.routing.module.ts -- see the comment there for why. Preserves
    // the exact same protection (redirect already-logged-in users away
    // from these pages) at the leaf level instead of the parent.
    path: 'signin', component: SigninComponent,
    canActivate: [UnauthGuard],
    data: {
      isMobileViewAllowed: true
    }
  },
  { path: 'signup', component: SignupComponent, canActivate: [UnauthGuard] },
  { path: 'reset-password', component: ResetPasswordComponent, canActivate: [UnauthGuard] },
  { path: 'change-password', component: ChangePwComponent, canActivate: [UnauthGuard] },
  { path: 'verify', component: AccountAuthenticationComponent, canActivate: [UnauthGuard] },
  // No `path: ''` entry here on purpose: AuthModule is mounted at the
  // root path in app.routing.module.ts alongside PublicModule. A bare
  // '' -> redirectTo: 'signin' here used to hijack every guest visit to
  // '/' before PublicModule's MainPortalComponent (the information
  // portal) ever got a chance to match -- guests always landed on
  // /signin instead of the portal. Removing it lets unmatched '' fall
  // through to PublicModule's own '' route. /signin and /signup remain
  // fully reachable directly, unchanged.
];

@NgModule({
  declarations: [
    SignupComponent,
    SigninComponent,
    ResetPasswordComponent,
    ChangePwComponent,
    AccountAuthenticationComponent,
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
