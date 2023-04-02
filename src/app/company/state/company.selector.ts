import { createFeatureSelector, createSelector } from "@ngrx/store";
import { CompanyState } from './company.reducer';

const getCompanyInitState = createFeatureSelector<CompanyState >('company');

export const loading = createSelector (
  getCompanyInitState,
  state => state.loading
);

export const getSuccessMsg = createSelector (
  getCompanyInitState,
  state => state.succesMsg
);

export const getCompanyList = createSelector (
  getCompanyInitState,
  state => state.list
);

export const getCompanyDetails = createSelector (
  getCompanyInitState,
  state => state.selected
);

export const companyDashboard = createSelector (
  getCompanyInitState,
  state => state.dashboard
);

export const getSetupList = createSelector(
  getCompanyInitState,
  state => state.setup
);

export const getIndustryList = createSelector(
  getCompanyInitState,
  state => state.industry
);

export const getCompanyUsers = createSelector(
  getCompanyInitState,
  state => state.users
);

export const getCompanySubscription = createSelector(
  getCompanyInitState,
  state => state.subs
);
