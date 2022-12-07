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
  // jobList$ = this.store.pipe(select(fromfeature.getJobList));
  success$ = this.store.pipe(select(fromfeature.success));
  error$: any;

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
