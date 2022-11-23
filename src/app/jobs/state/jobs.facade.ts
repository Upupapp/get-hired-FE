import { Injectable } from "@angular/core";
import * as Model from '../jobs.model';
import { State } from './jobs.reducer';
import { select, Store } from "@ngrx/store";
import * as JobAction from './jobs.actions';
import * as fromfeature from './jobs.selector';

@Injectable()
export class JobsFacade {
  loading$ = this.store.pipe(select(fromfeature.loading));
  jobDetails$ = this.store.pipe(select(fromfeature.getJobDetails));
  jobList$ = this.store.pipe(select(fromfeature.getJobList));
  success$ = this.store.pipe(select(fromfeature.success));
  error$: any;

  constructor(
    private store: Store<State>,
  ) { }

  getPublishedList(companyId?: string) {
    this.store.dispatch(JobAction.getPublishedJobList({ companyId }));
  }

}
