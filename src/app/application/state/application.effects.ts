import { Injectable } from '@angular/core';
import {
  of
} from 'rxjs';
import {
  catchError,
  map,
  mergeMap
} from 'rxjs/operators';
import {
  Actions,
  ofType,
  createEffect
} from '@ngrx/effects';
import * as Model from '../application.model';
import { ApplicationService } from '../application.service';
import * as ApplicationActions from './application.actions';

@Injectable()
export class ApplicationEffects {

  constructor(
    private applicationService: ApplicationService,
    private actions$: Actions,
  ) { }

  submitApplication$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ApplicationActions.submitApplication),
      mergeMap((action) => this.applicationService.submitApplication(action.application)
        .pipe(
          map((res: any) => {
            const application: Model.Application = res.data;
            return ApplicationActions.submitApplicationSuccess({ application });
          }),
          // LAUNCH-01: distinguish HTTP 409 (duplicate) from other errors
          // so the FE can show the appropriate inline panel.
          catchError((err) => {
            const errBody = err && err.error ? err.error : {};
            const errorCode = err && err.status === 409
              ? (errBody.code || 'JOB_APPLICATION_ALREADY_EXISTS')
              : null;
            const errorMsg = errBody.error || errBody.message || 'Something went wrong. Please try again.';
            return of(ApplicationActions.submitApplicationFail({ payload: errorMsg, errorCode: errorCode }));
          })
        )
      )
    );
  });

}
