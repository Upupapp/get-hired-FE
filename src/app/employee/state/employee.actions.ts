import {
  createAction,
  props
} from "@ngrx/store";
import * as Model from '../employee.model';

enum AllEmployeeActionTypes {
  GetAllEmployee = '[employee] - Get All Job Order',
  GetAllEmployeeSuccess = '[employee] - Get All Job Order Success',
  GetAllEmployeeFail = '[employee] - Get All Job Order Fail',

  CreateEmployee = '[employee] - Create Employee',
  CreateEmployeeSuccess = '[employee] - Create Employee Success',
  CreateEmployeeFail = '[employee] - Create Employee Fail',

  GetEmployeeProfile = '[employee] - Get Employee Profile',
  GetEmployeeProfileSuccess = '[employee] - Get Employee Profile Success',
  GetEmployeeProfileFail = '[employee] - Get Employee Profile Fail',

  GetEmployeeCompany = '[employee] - Get Employee Company',
  GetEmployeeCompanySuccess = '[employee] - Get Employee Company Success',
  GetEmployeeCompanyFail = '[employee] - Get Employee Company Fail',

}

export const getAllemployee = createAction(
  AllEmployeeActionTypes.GetAllEmployee,
);

export const getAllemployeeSuccess = createAction(
  AllEmployeeActionTypes.GetAllEmployeeSuccess,
  props<{ employee: Model.Employee[] }>()
);

export const getAllemployeeFail = createAction(
  AllEmployeeActionTypes.GetAllEmployeeFail,
  props<{ payload: any }>()
);

export const createEmployee = createAction(
  AllEmployeeActionTypes.CreateEmployee,
  props<{ employee: Model.Employee }>()
);

export const createEmployeeSuccess = createAction(
  AllEmployeeActionTypes.CreateEmployeeSuccess,
  props<{ employee: Model.Employee }>()
);

export const createEmployeeFail = createAction(
  AllEmployeeActionTypes.CreateEmployeeFail,
  props<{ payload: any }>()
);

export const getEmployeeProfile = createAction(
  AllEmployeeActionTypes.GetEmployeeProfile,
  props<{ id: string }>()
);

export const getEmployeeProfileSuccess = createAction(
  AllEmployeeActionTypes.GetEmployeeProfileSuccess,
  props<{ employee: Model.Employee }>()
);

export const getEmployeeProfileFail = createAction(
  AllEmployeeActionTypes.GetEmployeeProfileFail,
  props<{ payload: any }>()
);

export const getEmployeeCompany = createAction(
  AllEmployeeActionTypes.GetEmployeeCompany,
  props<{ id: string }>()
);

export const getEmployeeCompanySuccess = createAction(
  AllEmployeeActionTypes.GetEmployeeCompanySuccess,
  props<{ company: Model.EmployeeCompany }>()
);

export const getEmployeeCompanyFail = createAction(
  AllEmployeeActionTypes.GetEmployeeCompanyFail,
  props<{ payload: any }>()
);
