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
          catchError((err) => {
            const { error } = err.error;
            return of(ApplicationActions.submitApplicationFail({ payload: error }))
          })
        )
      )
    );
  });

}
