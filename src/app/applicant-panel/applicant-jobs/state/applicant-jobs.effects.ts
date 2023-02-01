import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { catchError, map, mergeMap, switchMap } from 'rxjs/operators';
import { Actions, ofType, createEffect } from '@ngrx/effects';
import { ApplicantJobsService } from '../applicant-jobs.service';
import * as ApplicantJobsActions from './applicant-jobs.actions';

@Injectable()
export class ApplicantJobsEffects {
  constructor(
    private applicantJobsService: ApplicantJobsService,
    private actions$: Actions
  ) { }


  getApplicantJobsDetails$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ApplicantJobsActions.getApplicantJobs),
      mergeMap((action) => this.applicantJobsService.getApplicantJobs(action.payload)
        .pipe(
          switchMap((res: any) => {
            return [
              ApplicantJobsActions.getApplicantJobsSuccess(res),
            ];
          }),
          catchError((err) => {
            const { error } = err;
            return of(ApplicantJobsActions.getApplicantJobsFail({ payload: error }));
          })
        )
      )
    );
  });
}
