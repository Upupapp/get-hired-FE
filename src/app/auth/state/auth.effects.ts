import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { of } from "rxjs";
import { catchError, map, mergeMap, switchMap } from "rxjs/operators";
import * as Model from '../auth.model';
import { AuthService } from "../auth.service";
import * as AuthActions from './auth.actions';
import * as AppActions from '@main/state/app.actions';

@Injectable()
export class AuthEffects {

  constructor(
    private authService: AuthService,
    private actions$: Actions
  ) { }

  private handleError(error: any, caught: any): any {
    localStorage.setItem('notFound', 'true');
    throw error;
  }

  // error handler authorize
  private handleErrorAuthorize(error: any, caught: any): any {
    localStorage.setItem('notFound', 'true');
    throw error;
  }

  signInAuth$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AuthActions.getAuthCredentials),
      mergeMap((action) => this.authService.signIn(action.loginCredentials)
        .pipe(
          switchMap((res: any) => {
            const credentials: Model.Credentials = res.data;
            return [
              AuthActions.getAuthCredentialsSuccess({ credentials }),
              AppActions.refreshAuthCredentialsSuccess({ credentials })
            ];
          }),
          catchError((err) => {
            const { error } = err.error;
            localStorage.setItem('notFound', 'true');
            localStorage.setItem('loginError', error);
            return of(AuthActions.getAuthCredentialsFail({payload: error}))
          })
        ))
    )
  });

  signUp$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AuthActions.createAuthCredentials),
      mergeMap((action) => this.authService.signUp(action.credentials)
        .pipe(
          map((res: any) => {
            const credentials: Model.Credentials = res.data;
            return AuthActions.createAuthCredentialsSuccess({ credentials });
          }),
          catchError((err) => {
            const { error } = err.error;
            localStorage.setItem('notFound', 'true');
            localStorage.setItem('signupError', error);
            return of(AuthActions.createAuthCredentialsFail({payload: error}))
          })
        ))
    )
  });

  profile$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AuthActions.getUserProfile),
      mergeMap(() => this.authService.getUserProfile()
        .pipe(
          map((res: any) => {
            const profile: Model.User = res.data;
            return AuthActions.getUserProfileSuccess({ profile });
          }),
          catchError((err) => {
            const { error } = err.error;
            return of(AuthActions.getUserProfileFail({payload: error}))
          })
        ))
    )
  });

  profileUpdate$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AuthActions.updateUserProfile),
      mergeMap((action) => this.authService.updateUserProfile(action.profile)
        .pipe(
          map((res: any) => {
            const profile: Model.User = res.data;
            return AuthActions.updateUserProfileSuccess({ profile });
          }),
          catchError((err) => {
            const { error } = err.error;
            return of(AuthActions.updateUserProfileFail({payload: error}))
          })
        ))
    )
  });
}
