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
import * as CompanyActions from './companies.actions';
import * as Model from '../companies.model';
import { CompaniesService } from '../companies.service';

@Injectable()
export class CompaniesEffects {
  constructor(
    private companiesService: CompaniesService,
    private actions$: Actions,
  ) { }

  // getAllCompany$ = createEffect(() => {
  //   return this.actions$.pipe(
  //     ofType(CompanyActions.getAllcompany),
  //     mergeMap(() => this.companiesService.getAllCompany()
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

  getAllFeaturedCompany$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CompanyActions.getAllFeaturedCompany),
      mergeMap(() => this.companiesService.getAllFeaturedCompanies()
        .pipe(
          map((res: any) => {
            const company: Model.BasicInfo[] = res.data;
            return CompanyActions.getAllFeaturedCompanySuccess({ company });
          }),
          catchError((err) => {
            const { error } = err.error;
            return of(CompanyActions.getAllFeaturedCompanyFail({ payload: error }))
          })
        )
      )
    );
  });

  getCompany$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CompanyActions.getCompany),
      mergeMap((action) => this.companiesService.getCompanyById(action.companyId)
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

}
