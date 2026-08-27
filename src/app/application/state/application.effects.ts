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
            // BUGFIX: a 413 (payload too large -- almost always an
            // oversized base64 video interview answer, see server.js's new
            // /api/application/apply size limit + JSON error handler) was
            // falling into the generic branch below and showing "Something
            // went wrong. Please try again." with no indication of what
            // was actually wrong or how to fix it.
            const errorCode = err && err.status === 409
              ? (errBody.code || 'JOB_APPLICATION_ALREADY_EXISTS')
              : err && err.status === 413
                ? (errBody.code || 'PAYLOAD_TOO_LARGE')
                : null;
            const errorMsg = errBody.error || errBody.message ||
              (err && err.status === 413
                ? 'One of your uploaded files is too large -- this is most often a recorded video interview answer. Please remove or re-record the oversized video and try again.'
                : 'Something went wrong. Please try again.');
            return of(ApplicationActions.submitApplicationFail({ payload: errorMsg, errorCode: errorCode }));
          })
        )
      )
    );
  });

}
