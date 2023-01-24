import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { catchError, map, mergeMap, switchMap } from 'rxjs/operators';
import { Actions, ofType, createEffect } from '@ngrx/effects';
import * as AdminActions from './admin.actions';
import * as Model from '../admin.model';
import { AdminService } from '../admin.service';

@Injectable()
export class AdminEffects {
  constructor(
    private adminService: AdminService,
    private actions$: Actions
  ) { }

  adminDashboard$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AdminActions.adminDashboard),
      mergeMap(() => this.adminService.getDashboardDetails()
        .pipe(
          map((res: any) => {
            const dashboard: Model.Dashboard = res.data;
            return AdminActions.adminDashboardSuccess({ dashboard });
          }),
          catchError((err) => {
            const { error } = err.error;
            return of(AdminActions.adminDashboardFail({ payload: error }))
          })
        )
      )
    );
  });

  user$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AdminActions.getUserProfile),
      mergeMap((action) => this.adminService.userProfile(action.userId)
        .pipe(
          map((res: any) => {
            const user: Model.User = res.data;
            return AdminActions.getUserProfileSuccess({ user });
          }),
          catchError((err) => {
            const { error } = err.error;
            return of(AdminActions.getUserProfileFail({ payload: error }))
          })
        )
      )
    );
  });

}
