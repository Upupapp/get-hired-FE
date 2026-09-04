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
            // Safely extract message — err.error may be null (network error) or a plain
            // string (non-JSON response); never destructure blindly to avoid observer crash
            const body = err && err.error;
            const message = (body && body.error) || (body && body.message)
              || (typeof body === 'string' ? body : null)
              || 'Sign in failed. Please try again.';
            localStorage.setItem('notFound', 'true');
            localStorage.setItem('loginError', message);
            return of(AuthActions.getAuthCredentialsFail({ payload: message }));
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
            // Safely extract message — err.error can be null (network error)
            // or a plain string (non-JSON response); never destructure blindly
            const body = err && err.error;
            const message = (body && body.error) || (body && body.message)
              || (typeof body === 'string' ? body : null)
              || 'Registration failed. Please try again.';
            localStorage.setItem('notFound', 'true');
            localStorage.setItem('signupError', message);
            return of(AuthActions.createAuthCredentialsFail({ payload: message }));
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
            // Safely extract message -- err.error may be null (network error)
            // or a plain string (non-JSON response); never destructure blindly
            // (same fix as signInAuth$/signUp$ above -- this effect stream
            // previously threw synchronously on a network error instead of
            // emitting a Fail action, killing the stream for the rest of the
            // session).
            const body = err && err.error;
            const error = (body && body.error) || (body && body.message)
              || (typeof body === 'string' ? body : null)
              || 'Failed to load profile. Please try again.';
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
            // Safely extract message -- see profile$'s catchError above for
            // the full rationale (same crash-the-stream bug, same fix).
            const body = err && err.error;
            const error = (body && body.error) || (body && body.message)
              || (typeof body === 'string' ? body : null)
              || 'Failed to update profile. Please try again.';
            return of(AuthActions.updateUserProfileFail({payload: error}))
          })
        ))
    )
  });
}
