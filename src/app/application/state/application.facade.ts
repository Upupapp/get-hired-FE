import { Injectable } from "@angular/core";
import * as Model from '../application.model';
import { State } from './application.reducer';
import { select, Store } from "@ngrx/store";
import * as JobAction from './application.actions';
import * as fromfeature from './application.selector';

@Injectable()
export class ApplicationFacade {
  loading$ = this.store.pipe(select(fromfeature.loading));
  // jobDetails$ = this.store.pipe(select(fromfeature.getJobDetails));
  // jobList$ = this.store.pipe(select(fromfeature.getJobList));
  success$ = this.store.pipe(select(fromfeature.success));
  error$: any;

  constructor(
    private store: Store<State>,
  ) { }

  // getPublishedList(companyId?: string) {
  //   this.store.dispatch(JobAction.getPublishedJobList({ companyId }));
  // }

}
