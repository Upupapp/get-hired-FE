import { Injectable } from "@angular/core";
import * as Model from '../employee.model';
import { State } from './employee.reducer';
import { select, Store } from "@ngrx/store";
import * as EmployeeAction from './employee.actions';
import * as fromfeature from './employee.selector';

@Injectable()
export class EmployeeFacade {
    loading$ = this.store.pipe(select(fromfeature.loading));
    employeeDetails$ = this.store.pipe(select(fromfeature.getEmployeeDetails));
    employeeList$ = this.store.pipe(select(fromfeature.getEmployeeList));
    comapny$ = this.store.pipe(select(fromfeature.getEmployeeCompany));

    constructor(
      private store: Store<State>,
      ) { }

    getAllEmployee() {
      this.store.dispatch(EmployeeAction.getAllemployee());
    }

    getEmployeeProfile(id: string) {
      this.store.dispatch(EmployeeAction.getEmployeeProfile({ id }));
    }

    getEmployeeCompany(id: string) {
      this.store.dispatch(EmployeeAction.getEmployeeCompany({ id }));
    }

    // getfeatureList() {

    // }

    // getfeatureDetails(featureId: string) {

    // }
}
