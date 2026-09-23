import { Injectable } from '@angular/core';
import { State } from './admin.reducer';
import { select, Store } from '@ngrx/store';
import * as AdminAction from './admin.actions';
import * as fromfeature from './admin.selector';
import { AdminTimeRange } from '../admin-time';

@Injectable()
export class AdminFacade {
  loading$ = this.store.pipe(select(fromfeature.loading));
  adminDetails$ = this.store.pipe(select(fromfeature.getAdminById));
  user$ = this.store.pipe(select(fromfeature.getUser));
  success$ = this.store.pipe(select(fromfeature.success));
  dashboard$ = this.store.pipe(select(fromfeature.adminDashboard));
  dashboardLoading$ = this.store.pipe(select(fromfeature.dashboardLoading));
  dashboardError$ = this.store.pipe(select(fromfeature.dashboardError));

  error$: any;

  constructor(private store: Store<State>) {}


  getAdminDashboard(range: AdminTimeRange) {
    this.store.dispatch(AdminAction.adminDashboard({ range }));
  }

  getUser(userId: string) {
    this.store.dispatch(AdminAction.getUserProfile({ userId }));
  }

}
