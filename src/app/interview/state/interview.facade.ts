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
  success$ = this.store.pipe(select(fromfeature.success));
  error$: any;

  constructor(
    private store: Store<State>,
  ) { }

  getInterviewList(companyId: string) {
    this.store.dispatch(InterviewAction.getInterviewList({ companyId }));
  }

}
