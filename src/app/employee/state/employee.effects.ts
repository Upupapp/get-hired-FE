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
import * as EmployeeActions from './employee.actions';
import * as Model from '../employee.model';
import { EmployeeService } from '../employee.service';

@Injectable()
export class EmployeeEffects {

  constructor(
    private employeeService: EmployeeService,
    private actions$: Actions,
  ) { }

  // getAllEmployee$ = createEffect(() => {
  //   return this.actions$.pipe(
  //     ofType(EmployeeActions.getAllemployee),
  //     mergeMap(() => this.employeeService.getAllEmployee()
  //       .pipe(
  //         map((res: any) => {
  //           const employee: Model.Employee[] = res.data;
  //           return EmployeeActions.getAllemployeeSuccess({ employee });
  //         }),
  //         catchError((err) => {
  //           const { error } = err.error;
  //           return of(EmployeeActions.getAllemployeeFail({ payload: error }))
  //         })
  //       )
  //     )
  //   );
  // });

  //  createEmployee$ = createEffect(() => {
  //   return this.actions$.pipe(
  //     ofType(EmployeeActions.createEmployee),
  //     mergeMap((action) => this.employeeService.createEmployee(action.employee)
  //       .pipe(
  //         map((res: any) => {
  //           const employee: Model.Employee = res.data;
  //           return EmployeeActions.createEmployeeSuccess({ employee });
  //         }),
  //         catchError((err) => {
  //           const { error } = err.error;
  //           return of(EmployeeActions.createEmployeeFail({ payload: error }))
  //         })
  //       )
  //     )
  //   );
  // });

  getEmployeeProfile$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(EmployeeActions.getEmployeeProfile),
      mergeMap((action) => this.employeeService.getEmployeeProfile(action.id)
        .pipe(
          map((res: any) => {
            const employee: Model.Employee = res.data;
            return EmployeeActions.getEmployeeProfileSuccess({ employee });
          }),
          catchError((err) => {
            const { error } = err.error;
            return of(EmployeeActions.getEmployeeProfileFail({ payload: error }))
          })
        )
      )
    );
  });

  getEmployeeCompany$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(EmployeeActions.getEmployeeCompany),
      mergeMap((action) => this.employeeService.getEmployeeCompany(action.id)
        .pipe(
          map((res: any) => {
            const company: Model.EmployeeCompany = res.data;
            return EmployeeActions.getEmployeeCompanySuccess({ company });
          }),
          catchError((err) => {
            const { error } = err.error;
            return of(EmployeeActions.getEmployeeCompanyFail({ payload: error }))
          })
        )
      )
    );
  });
}
