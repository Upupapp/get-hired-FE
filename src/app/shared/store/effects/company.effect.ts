import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { Actions, ofType, Effect, createEffect } from '@ngrx/effects';

//import enum action types
import { CompanyActionTypes } from '../actions/company.action';
import { CompanyService } from '../../services/api/company.service';

@Injectable()
export class CompanyEffect {
  constructor(
    private companyService: CompanyService,
    private actions$: Actions
  ) {}

public getCompanyUserList = createEffect(() =>
    this.actions$.pipe(
        // set type
        ofType(CompanyActionTypes.GET_COMPANY_USER_LIST),
        // switch to a new observable and cancel previous subscription
        switchMap((data: any) => {
        return this.companyService.getCompanyUserList(data).pipe(
            // return payload
            map((result: any) => {
            return {
                type: CompanyActionTypes.GET_COMPANY_USER_LIST_SUCCESS,
                payload: result,
            };
            }),
            catchError((error: any) =>
            // error handler
            of({
                type: CompanyActionTypes.GET_COMPANY_USER_LIST_FAIL,
                payload: error,
            })
            )
        );
        })
    )
);

public inviteCompanyUser = createEffect(() =>
this.actions$.pipe(
  // set type
  ofType(CompanyActionTypes.SAVE_COMPANY_USER),
  // switch to a new observable and cancel previous subscription
  switchMap((data: any) => {
    return this.companyService.InviteCompanyUser(data?.payload)
      .pipe(
        // return payload
        map((result: any) => {
          console.log(result, "result");
          return {
            type: CompanyActionTypes.SAVE_COMPANY_USER_SUCCESS,
            payload: result
          };
        }),
        catchError((error: any) =>
          // error handler
          of({
            type: CompanyActionTypes.SAVE_COMPANY_USER_FAIL,
            payload: error,
          }),
        ),
      );
  }),
),
)

}