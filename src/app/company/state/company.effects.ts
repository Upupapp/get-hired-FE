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
            const payload = (err && err.error && err.error.error) || (err && err.message) || 'An error occurred';
            return of(CompanyActions.createCompanyFail({ payload }))
          })
        )
      )
    );
  });

  createInitialCompany$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CompanyActions.createInitialCompany),
      mergeMap((action) => this.companyService.createInitialCompany(action.companyName, action.companyEmail)
        .pipe(
          map((res: any) => {
            const company: Model.Company = res.data;
            return CompanyActions.createInitialCompanySuccess({ company });
          }),
          catchError((err) => {
            const payload = (err && err.error && err.error.error) || (err && err.message) || 'An error occurred';
            return of(CompanyActions.createInitialCompanyFail({ payload }))
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
            // Pass the full error body so the form component can read
            // feedback.state + fieldErrors for validation errors from BE.
            const errBody = (err && err.error) ? err.error : null;
            const payload = errBody || (err && err.message) || 'An error occurred';
            return of(CompanyActions.updateCompanyFail({ payload }))
          })
        )
      )
    );
  });

  getCompany$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CompanyActions.getCompany),
      mergeMap(() => this.companyService.getUserCompany()
        .pipe(
          map((res: any) => {
            const company: Model.Company = res.data;
            return CompanyActions.getCompanySuccess({ company });
          }),
          catchError((err) => {
            const payload = (err && err.error && err.error.error) || (err && err.message) || 'An error occurred';
            return of(CompanyActions.getCompanyFail({ payload }))
          })
        )
      )
    );
  });

  getCompanyUsers$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CompanyActions.getCompanyUsers),
      mergeMap((action) => this.companyService.getCompanyUsers(action.companyId)
        .pipe(
          map((res: any) => {
            const users: Model.CompanyUser[] = res.data;
            return CompanyActions.getCompanyUsersSuccess({ users });
          }),
          catchError((err) => {
            const payload = (err && err.error && err.error.error) || (err && err.message) || 'An error occurred';
            return of(CompanyActions.getCompanyUsersFail({ payload }))
          })
        )
      )
    );
  });

  getCompanySubscription$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CompanyActions.getCompanySubscription),
      mergeMap((action) => this.companyService.checkCompanySubscription(action.companyId)
        .pipe(
          map((res: any) => {
            const subscription: Model.CompanySubscriptions = res.data;
            return CompanyActions.getCompanySubscriptionSuccess({ subscription });
          }),
          catchError((err) => {
            const payload = (err && err.error && err.error.error) || (err && err.message) || 'An error occurred';
            return of(CompanyActions.getCompanySubscriptionFail({ payload }))
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
            const payload = (err && err.error && err.error.error) || (err && err.message) || 'An error occurred';
            return of(CompanyActions.companyDashboardFail({ payload }))
          })
        )
      )
    );
  });

  setupList$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CompanyActions.getSetupList),
      mergeMap(() => this.companyService.getSetupList()
        .pipe(
          map((res: any) => {
            const setup: Model.Options[] = res.data;
            return CompanyActions.getSetupListSuccess({ setup });
          }),
          catchError((err) => {
            const payload = (err && err.error && err.error.error) || (err && err.message) || 'An error occurred';
            return of(CompanyActions.getSetupListFail({ payload }))
          })
        )
      )
    );
  });

  industryList$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CompanyActions.getIndustryList),
      mergeMap(() => this.companyService.getIndustryList()
        .pipe(
          map((res: any) => {
            const industry: Model.Options[] = res.data;
            return CompanyActions.getIndustryListSuccess({ industry });
          }),
          catchError((err) => {
            const payload = (err && err.error && err.error.error) || (err && err.message) || 'An error occurred';
            return of(CompanyActions.getIndustryListFail({ payload }))
          })
        )
      )
    );
  });
}
