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
import * as Model from '../interview.model';
import { InterviewService } from '../interview.service';
import * as InterviewActions from './interview.actions';

@Injectable()
export class InterviewEffects {

  constructor(
    private interviewService: InterviewService,
    private actions$: Actions,
  ) { }

  getInterview$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(InterviewActions.getInterviewList),
      mergeMap((action) => this.interviewService.getInterview(action.companyId)
        .pipe(
          map((res: any) => {
            const interviews: Model.GroupInterview[] = res.data;
            return InterviewActions.getInterviewListSuccess({ interviews });
          }),
          catchError((err) => {
            const { error } = err.error;
            return of(InterviewActions.getInterviewListFail({ payload: error }))
          })
        )
      )
    );
  });

}
