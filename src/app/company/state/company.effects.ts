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
}
