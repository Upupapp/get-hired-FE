import {
  createAction,
  props
} from "@ngrx/store";
import * as Model from '../companies.model';

enum AllCompaniesActionTypes {
  GetAllFeaturedCompany = '[companies] - Get All Featured Company',
  GetAllFeaturedCompanySuccess = '[companies] - Get All Featured CompanySuccess',
  GetAllFeaturedCompanyFail = '[companies] - Get All Featured Company Fail',

  GetAllCompany = '[companies] - Get All Company',
  GetAllCompanySuccess = '[companies] - Get All CompanySuccess',
  GetAllCompanyFail = '[companies] - Get All Company Fail',

  GetCompany = '[companies] - Get Company',
  GetCompanySuccess = '[companies] - Get Company Success',
  GetCompanyFail = '[companies] - Get Company Fail',

  ResetState = '[companies] - Reset State'

}

export const getAllFeaturedCompany = createAction(
  AllCompaniesActionTypes.GetAllFeaturedCompany,
);

export const getAllFeaturedCompanySuccess = createAction(
  AllCompaniesActionTypes.GetAllFeaturedCompanySuccess,
  props<{ company: Model.BasicInfo[] }>()
);

export const getAllFeaturedCompanyFail = createAction(
  AllCompaniesActionTypes.GetAllCompanyFail,
  props<{ payload: any }>()
);

export const resetState = createAction(
  AllCompaniesActionTypes.ResetState,
);

export const getAllcompany = createAction(
  AllCompaniesActionTypes.GetAllCompany,
);

export const getAllcompanySuccess = createAction(
  AllCompaniesActionTypes.GetAllCompanySuccess,
  props<{ company: Model.Company[] }>()
);

export const getAllcompanyFail = createAction(
  AllCompaniesActionTypes.GetAllCompanyFail,
  props<{ payload: any }>()
);

export const getCompany = createAction(
  AllCompaniesActionTypes.GetCompany,
  props<{ companyId: string }>()
);

export const getCompanySuccess = createAction(
  AllCompaniesActionTypes.GetCompanySuccess,
  props<{ company: Model.Company }>()
);

export const getCompanyFail = createAction(
  AllCompaniesActionTypes.GetCompanyFail,
  props<{ payload: any }>()
);
