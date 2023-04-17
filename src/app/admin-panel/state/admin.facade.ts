import { Injectable } from '@angular/core';
import { State } from './admin.reducer';
import { select, Store } from '@ngrx/store';
import * as AdminAction from './admin.actions';
import * as fromfeature from './admin.selector';
import * as InterviewModel from '@main/interview/interview.model';

@Injectable()
export class AdminFacade {
  loading$ = this.store.pipe(select(fromfeature.loading));
  adminDetails$ = this.store.pipe(select(fromfeature.getAdminById));
  user$ = this.store.pipe(select(fromfeature.getUser));
  success$ = this.store.pipe(select(fromfeature.success));
  dashboard$ = this.store.pipe(select(fromfeature.adminDashboard));

  error$: any;

  constructor(private store: Store<State>) {}


  getAdminDashboard() {
    this.store.dispatch(AdminAction.adminDashboard());
  }

  getUser(userId: string) {
    this.store.dispatch(AdminAction.getUserProfile({ userId }));
  }

}
