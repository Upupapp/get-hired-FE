import { createFeatureSelector, createSelector } from "@ngrx/store";
import { EmployeeState } from './employee.reducer';

const getEmployeeInitState = createFeatureSelector<EmployeeState >('employee');

export const loading = createSelector (
  getEmployeeInitState,
  state => state.loading
);

export const getEmployeeList = createSelector (
  getEmployeeInitState,
  state => state.list
);

export const getEmployeeDetails = createSelector (
  getEmployeeInitState,
  state => state.selected
);

export const getEmployeeCompany = createSelector (
  getEmployeeInitState,
  state => state.employeeCompany
);

