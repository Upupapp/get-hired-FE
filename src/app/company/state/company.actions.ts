import {
  createAction,
  props
} from "@ngrx/store";
import * as Model from '../company.model';

enum AllCompanyActionTypes {
  GetAllCompany = '[company] - Get All Company',
  GetAllCompanySuccess = '[company] - Get All CompanySuccess',
  GetAllCompanyFail = '[company] - Get All Company Fail',

  GetCompany = '[company] - Get Company',
  GetCompanySuccess = '[company] - Get Company Success',
  GetCompanyFail = '[company] - Get Company Fail',

  CreateCompany = '[company] - Create Company',
  CreateCompanySuccess = '[company] - Create Company Success',
  CreateCompanyFail = '[company] - Create Company Fail',

  UpdateCompany = '[company] - Update Company',
  UpdateCompanySuccess = '[company] - Update Company Success',
  UpdateCompanyFail = '[company] - Update Company Fail'
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

export const getCompany = createAction(
  AllCompanyActionTypes.GetCompany,
  props<{ companyId: string }>()
);

export const getCompanySuccess = createAction(
  AllCompanyActionTypes.GetCompanySuccess,
  props<{ company: Model.Company }>()
);

export const getCompanyFail = createAction(
  AllCompanyActionTypes.GetCompanyFail,
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

export const updateCompany = createAction(
  AllCompanyActionTypes.UpdateCompany,
  props<{ company: Model.Company }>()
);

export const updateCompanySuccess = createAction(
  AllCompanyActionTypes.UpdateCompanySuccess,
  props<{ company: Model.Company }>()
);

export const updateCompanyFail = createAction(
  AllCompanyActionTypes.UpdateCompanyFail,
  props<{ payload: any }>()
);
