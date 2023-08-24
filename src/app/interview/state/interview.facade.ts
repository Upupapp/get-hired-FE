import { Injectable } from "@angular/core";
import * as Model from '../interview.model';
import { State } from './interview.reducer';
import { select, Store } from "@ngrx/store";
import * as InterviewAction from './interview.actions';
import * as fromfeature from './interview.selector';

@Injectable()
export class InterviewFacade {
  loading$ = this.store.pipe(select(fromfeature.loading));
  // interviewDetails$ = this.store.pipe(select(fromfeature.getInterviewDetails));
  interviewList$ = this.store.pipe(select(fromfeature.getInterviewList));
  interviewTemplatesList$ = this.store.pipe(select(fromfeature.getInterviewTemplatesList));
  interviewRecipientList$ = this.store.pipe(select(fromfeature.getInterviewRecipientList));
  interviewTemplateQuestions$ = this.store.pipe(select(fromfeature.getInterviewTemplateQuestions));
  success$ = this.store.pipe(select(fromfeature.success));
  error$: any;

  constructor(
    private store: Store<State>,
  ) { }

  getInterviewList(companyId: string) {
    this.store.dispatch(InterviewAction.getInterviewList({ companyId }));
  }

  getInterviewTemplatesList(companyId: string) {
    this.store.dispatch(InterviewAction.getInterviewTemplatesList({ companyId }));
  }

  getInterviewRecipientList(companyId: string) {
    this.store.dispatch(InterviewAction.getInterviewRecipientList({ companyId }));
  }

  getInterviewTemplateQuestions(templateId: string) {
    this.store.dispatch(InterviewAction.getInterviewTemplateQuestions({ templateId }));
  }

  saveInterview(interview: Model.GroupInterview) {
    this.store.dispatch(InterviewAction.saveGroupInterview({ interview }));
  }

}
