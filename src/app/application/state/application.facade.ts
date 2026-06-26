import { Injectable } from "@angular/core";
import * as Model from '../application.model';
import { State } from './application.reducer';
import { select, Store } from "@ngrx/store";
import * as JobAction from './application.actions';
import * as fromfeature from './application.selector';

@Injectable()
export class ApplicationFacade {
  loading$ = this.store.pipe(select(fromfeature.loading));
  applicationDetails$ = this.store.pipe(select(fromfeature.getApplicationDetails));
  success$ = this.store.pipe(select(fromfeature.success));
  // LAUNCH-01: error state observables for inline feedback panels
  error$ = this.store.pipe(select(fromfeature.getError));
  errorCode$ = this.store.pipe(select(fromfeature.getErrorCode));
  // LAUNCH-01: combined result observable — subscribe once to handle all outcomes
  submitResult$ = this.store.pipe(select(fromfeature.getSubmitResult));

  constructor(
    private store: Store<State>,
  ) { }

  submitApplication(application: Model.Application) {
    this.store.dispatch(JobAction.submitApplication({ application }));
  }

  resetApplication() {
    this.store.dispatch(JobAction.resetApplication());
  }

}
