import {
  createAction,
  props
} from "@ngrx/store";
import * as Model from '../company.model';

enum AllCompanyActionTypes {
  GetAllCompany = '[company] - Get All Job Order',
  GetAllCompanySuccess = '[company] - Get All Job Order Success',
  GetAllCompanyFail = '[company] - Get All Job Order Fail',

  CreateCompany = '[company] - Create Company',
  CreateCompanySuccess = '[company] - Create Company Success',
  CreateCompanyFail = '[company] - Create Company Fail'

}

export const getAllcompany = createAction(
  AllCompanyActionTypes.GetAllCompany,
);

export const getAllcompanySuccess = createAction(
  AllCompanyActionTypes.GetAllCompanySuccess,
  props<{ company: Model.Company[] }>()
);

export const getAllcompanyFail = createAction(
  AllCompanyActionTypes.GetAllCompanyFail,
  props<{ payload: any }>()
);

export const createCompany = createAction(
  AllCompanyActionTypes.CreateCompany,
  props<{ company: Model.Company }>()
);

export const createCompanySuccess = createAction(
  AllCompanyActionTypes.CreateCompanySuccess,
  props<{ company: Model.Company }>()
);

export const createCompanyFail = createAction(
  AllCompanyActionTypes.CreateCompanyFail,
  props<{ payload: any }>()
);
