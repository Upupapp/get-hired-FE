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

  getInterviewTemplates$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(InterviewActions.getInterviewTemplatesList),
      mergeMap((action) => this.interviewService.getInterviewTemplates(action.companyId)
        .pipe(
          map((res: any) => {
            const interviewTemplates: Model.InterviewQuestionTemplate[] = res.data;
            return InterviewActions.getInterviewTemplatesListSuccess({ interviewTemplates });
          }),
          catchError((err) => {
            const { error } = err.error;
            return of(InterviewActions.getInterviewTemplatesListFail({ payload: error }))
          })
        )
      )
    );
  });

  getInterviewRecipient$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(InterviewActions.getInterviewRecipientList),
      mergeMap((action) => this.interviewService.getInterviewRecipient(action.companyId)
        .pipe(
          map((res: any) => {
            const interviewRecipient: Model.InterviewRecipients = res.data;
            return InterviewActions.getInterviewRecipientListSuccess({ interviewRecipient });
          }),
          catchError((err) => {
            const { error } = err.error;
            return of(InterviewActions.getInterviewRecipientListFail({ payload: error }))
          })
        )
      )
    );
  });

  getInterviewTemplateQuestions$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(InterviewActions.getInterviewTemplateQuestions),
      mergeMap((action) => this.interviewService.getInterviewTemplateQuestions(action.templateId)
        .pipe(
          map((res: any) => {
            const interviewTemplateQuestions: Model.InterviewQuestion[] = res.data;
            return InterviewActions.getInterviewTemplateQuestionsSuccess({ interviewTemplateQuestions });
          }),
          catchError((err) => {
            const { error } = err.error;
            return of(InterviewActions.getInterviewTemplateQuestionsFail({ payload: error }))
          })
        )
      )
    );
  });

  saveGroupInterview$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(InterviewActions.saveGroupInterview),
      mergeMap((action) => this.interviewService.saveGroupInterview(action.interview)
        .pipe(
          map((res: any) => {
            const interview: Model.GroupInterview = res.data;
            return InterviewActions.saveGroupInterviewSuccess({ interview });
          }),
          catchError((err) => {
            const { error } = err.error;
            return of(InterviewActions.saveGroupInterviewFail({ payload: error }))
          })
        )
      )
    );
  });

}
