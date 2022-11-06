import * as AppState from '@main/app.state';
import { createReducer, on } from '@ngrx/store';
import * as Model from '../employee.model';
import * as EmployeeActions from './employee.actions';

export interface State extends AppState.State {
  employee: EmployeeState;
}

export interface EmployeeState {
  selected: Model.Employee;
  list: Model.Employee[];
  error: any;
  succesMsg: string;
  loading: boolean;
  employeeCompany: Model.EmployeeCompany;
}

const initialState: EmployeeState = {
  selected: null,
  list: [],
  succesMsg: '',
  error: null,
  loading: false,
  employeeCompany: null
};

export const employeeReducer = createReducer<EmployeeState>(
  initialState,
  on(EmployeeActions.getAllemployee, (state): EmployeeState => {
    return {
      ...state,
      loading: true
    };
  }),
  on(EmployeeActions.getAllemployeeSuccess, (state, action): EmployeeState => {
    return {
      ...state,
      loading: false,
      list: action.employee,
      error: null
    };
  }),
  on(EmployeeActions.getAllemployeeFail, (state, action): EmployeeState => {
    return {
      ...state,
      loading: false,
      error: action.payload
    };
  }),
  on(EmployeeActions.getEmployeeProfile, (state): EmployeeState => {
    return {
      ...state,
      loading: true,
      error: null
    };
  }),
  on(EmployeeActions.getEmployeeProfileSuccess, (state, action): EmployeeState => {
    return {
      ...state,
      loading: false,
      selected: action.employee,
      error: null
    };
  }),
  on(EmployeeActions.getEmployeeProfileFail, (state, action): EmployeeState => {
    return {
      ...state,
      loading: false,
      error: action.payload
    };
  }),
  on(EmployeeActions.getEmployeeCompany, (state): EmployeeState => {
    return {
      ...state,
      loading: true,
      error: null
    };
  }),
  on(EmployeeActions.getEmployeeCompanySuccess, (state, action): EmployeeState => {
    return {
      ...state,
      loading: false,
      employeeCompany: action.company,
      error: null
    };
  }),
  on(EmployeeActions.getEmployeeCompanyFail, (state, action): EmployeeState => {
    return {
      ...state,
      loading: false,
      error: action.payload
    };
  }),
);
