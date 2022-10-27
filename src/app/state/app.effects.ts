import { Injectable } from "@angular/core";
import { AuthService } from "@main/auth/auth.service";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { of } from "rxjs";
import { catchError, map, mergeMap } from "rxjs/operators";
import * as Model from '../app.model';
import * as AppActions from './app.actions';

@Injectable()
export class AppEffects {

  constructor(
    private authService: AuthService,
    private actions$: Actions
  ) { }

  getCredentials$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AppActions.refreshAuthCredentials),
      mergeMap((action) => this.authService.getUserCredentials(action.email)
        .pipe(
          map((res: any) => {
            const credentials: Model.Credentials = res.data;
            return AppActions.refreshAuthCredentialsSuccess({ credentials });
          }),
          catchError((err) => {
            const { error } = err.error;
            localStorage.setItem('notFound', 'true');
            localStorage.setItem('signupError', error);
            return of(AppActions.refreshAuthCredentialsFail({payload: error}))
          })
        ))
    )
  });
}
