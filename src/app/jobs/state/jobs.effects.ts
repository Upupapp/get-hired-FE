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
import * as Model from '../jobs.model';
import { JobsService } from '../jobs.service';
import * as JobsActions from './jobs.actions';

@Injectable()
export class JobsEffects {

  constructor(
    private jobsService: JobsService,
    private actions$: Actions,
  ) { }

  getPublishedJobs$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(JobsActions.getPublishedJobList),
      mergeMap((action) => this.jobsService.getPublishedJobs(action.companyId)
        .pipe(
          map((res: any) => {
            const publishedJobs: Model.BasicJob[] = res.data;
            return JobsActions.getPublishedJobListSuccess({ publishedJobs });
          }),
          catchError((err) => {
            const { error } = err.error;
            return of(JobsActions.getPublishedJobListFail({ payload: error }))
          })
        )
      )
    );
  });

}
