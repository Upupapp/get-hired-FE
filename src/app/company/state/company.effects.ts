import { Injectable } from '@angular/core';
import {
  of
} from 'rxjs';
import {
  catchError,
  map,
  mergeMap
} from 'rxjs/operators';
import {
  Actions,
  ofType,
  createEffect
} from '@ngrx/effects';
import * as CompanyActions from './company.actions';
import * as Model from '../company.model';
import { CompanyService } from '../company.service';

@Injectable()
export class CompanyEffects {

  constructor(
    private companyService: CompanyService,
    private actions$: Actions,
  ) { }

  // getAllCompany$ = createEffect(() => {
  //   return this.actions$.pipe(
  //     ofType(CompanyActions.getAllcompany),
  //     mergeMap(() => this.companyService.getAllCompany()
  //       .pipe(
  //         map((res: any) => {
  //           const company: Model.Company[] = res.data;
  //           return CompanyActions.getAllcompanySuccess({ company });
  //         }),
  //         catchError((err) => {
  //           const { error } = err.error;
  //           return of(CompanyActions.getAllcompanyFail({ payload: error }))
  //         })
  //       )
  //     )
  //   );
  // });

   createCompany$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CompanyActions.createCompany),
      mergeMap((action) => this.companyService.createCompany(action.company)
        .pipe(
          map((res: any) => {
            const company: Model.Company = res.data;
            return CompanyActions.createCompanySuccess({ company });
          }),
          catchError((err) => {
            const { error } = err.error;
            return of(CompanyActions.createCompanyFail({ payload: error }))
          })
        )
      )
    );
  });

  updateCompany$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CompanyActions.updateCompany),
      mergeMap((action) => this.companyService.updateCompany(action.company)
        .pipe(
          map((res: any) => {
            const company: Model.Company = res.data;
            return CompanyActions.updateCompanySuccess({ company });
          }),
          catchError((err) => {
            const { error } = err.error;
            return of(CompanyActions.updateCompanyFail({ payload: error }))
          })
        )
      )
    );
  });

  getCompany$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CompanyActions.getCompany),
      mergeMap((action) => this.companyService.getCompanyById(action.companyId)
        .pipe(
          map((res: any) => {
            const company: Model.Company = res.data;
            return CompanyActions.getCompanySuccess({ company });
          }),
          catchError((err) => {
            const { error } = err.error;
            return of(CompanyActions.getCompanyFail({ payload: error }))
          })
        )
      )
    );
  });

  companyDashboard$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CompanyActions.companyDashboard),
      mergeMap(() => this.companyService.getDashboardDetails()
        .pipe(
          map((res: any) => {
            const dashboard: Model.Dashboard = res.data;
            return CompanyActions.companyDashboardSuccess({ dashboard });
          }),
          catchError((err) => {
            const { error } = err.error;
            return of(CompanyActions.companyDashboardFail({ payload: error }))
          })
        )
      )
    );
  });
}
