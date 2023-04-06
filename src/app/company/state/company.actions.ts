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

  GetCompanyUsers = '[company] - Get Company Users',
  GetCompanyUsersSuccess = '[company] - Get Company Users Success',
  GetCompanyUsersFail = '[company] - Get Company Users Fail',

  GetCompanySubscription = '[company] - Get Company Subscription',
  GetCompanySubscriptionSuccess = '[company] - Get Company Subscription Success',
  GetCompanySubscriptionFail = '[company] - Get Company Subscription Fail',

  CreateCompany = '[company] - Create Company',
  CreateCompanySuccess = '[company] - Create Company Success',
  CreateCompanyFail = '[company] - Create Company Fail',

  CreateInitialCompany = '[company] - Create Initial Company',
  CreateInitialCompanySuccess = '[company] - Create Initial Company Success',
  CreateInitialCompanyFail = '[company] - Create Initial Company Fail',

  UpdateCompany = '[company] - Update Company',
  UpdateCompanySuccess = '[company] - Update Company Success',
  UpdateCompanyFail = '[company] - Update Company Fail',

  CompanyDashboard = '[company] - Company Dashboard',
  CompanyDashboardSuccess = '[company] - Company Dashboard Success',
  CompanyDashboardFail = '[company] - Company Dashboard Fail',

  GetSetupList = '[company] - Get Setup List',
  GetSetupListSuccess = '[company] - Get Setup List Success',
  GetSetupListFail = '[company] - Get Setup List Fail',

  GetIndustryList = '[company] - Get Industry List',
  GetIndustryListSuccess = '[company] - Get Industry List Success',
  GetIndustryListFail = '[company] - Get Industry List Fail',

  ResetState = '[company] - Reset State'

}

export const resetState = createAction(
  AllCompanyActionTypes.ResetState,
);

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

export const getCompanyUsers = createAction(
  AllCompanyActionTypes.GetCompanyUsers,
  props<{ companyId: string }>()
);

export const getCompanyUsersSuccess = createAction(
  AllCompanyActionTypes.GetCompanyUsersSuccess,
  props<{ users: Model.CompanyUser[] }>()
);

export const getCompanyUsersFail = createAction(
  AllCompanyActionTypes.GetCompanyUsersFail,
  props<{ payload: any }>()
);

export const getCompanySubscription = createAction(
  AllCompanyActionTypes.GetCompanySubscription,
  props<{ companyId: string }>()
);

export const getCompanySubscriptionSuccess = createAction(
  AllCompanyActionTypes.GetCompanySubscriptionSuccess,
  props<{ subscription: Model.CompanySubscriptions }>()
);

export const getCompanySubscriptionFail = createAction(
  AllCompanyActionTypes.GetCompanySubscriptionFail,
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

export const createInitialCompany = createAction(
  AllCompanyActionTypes.CreateInitialCompany,
  props<{ companyName: string, companyEmail: string }>()
);

export const createInitialCompanySuccess = createAction(
  AllCompanyActionTypes.CreateInitialCompanySuccess,
  props<{ company: Model.Company }>()
);

export const createInitialCompanyFail = createAction(
  AllCompanyActionTypes.CreateInitialCompanyFail,
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

export const companyDashboard = createAction(
  AllCompanyActionTypes.CompanyDashboard
);

export const companyDashboardSuccess = createAction(
  AllCompanyActionTypes.CompanyDashboardSuccess,
  props<{ dashboard: Model.Dashboard }>()
);

export const companyDashboardFail = createAction(
  AllCompanyActionTypes.CompanyDashboardFail,
  props<{ payload: any }>()
);

export const getIndustryList = createAction(
  AllCompanyActionTypes.GetIndustryList
);

export const getIndustryListSuccess = createAction(
  AllCompanyActionTypes.GetIndustryListSuccess,
  props<{ industry: Model.Options[] }>()
);

export const getIndustryListFail = createAction(
  AllCompanyActionTypes.GetIndustryListFail,
  props<{ payload: any }>()
);

export const getSetupList = createAction(
  AllCompanyActionTypes.GetSetupList
);

export const getSetupListSuccess = createAction(
  AllCompanyActionTypes.GetSetupListSuccess,
  props<{ setup: Model.Options[] }>()
);

export const getSetupListFail = createAction(
  AllCompanyActionTypes.GetSetupListFail,
  props<{ payload: any }>()
);
