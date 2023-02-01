import { Injectable } from '@angular/core';
import { State } from './applicant-jobs.reducer';
import { select, Store } from '@ngrx/store';
import * as ApplicantAction from './applicant-jobs.actions';
import * as fromfeature from './applicant-jobs.selector';
import * as InterviewModel from '@main/interview/interview.model';

@Injectable()
export class ApplicantJobsFacade {
  loading$ = this.store.pipe(select(fromfeature.loading));
  applicantJobs$ = this.store.pipe(select(fromfeature.getApplicantJobs));
  success$ = this.store.pipe(select(fromfeature.success));
  error$: any;

  constructor(private store: Store<State>) {}


  getApplicantJobs(payload: any) {
    this.store.dispatch(ApplicantAction.getApplicantJobs({payload}));
  }
}
