import { createFeatureSelector, createSelector } from "@ngrx/store";
import { CompaniesState } from './companies.reducer';

const getCompaniesInitState = createFeatureSelector<CompaniesState>('companies');

export const loading = createSelector (
  getCompaniesInitState,
  state => state.loading
);

export const getSuccessMsg = createSelector (
  getCompaniesInitState,
  state => state.succesMsg
);

export const getCompanyList = createSelector (
  getCompaniesInitState,
  state => state.list
);

export const getCompanyDetails = createSelector (
  getCompaniesInitState,
  state => state.selected
);

// export const companyDashboard = createSelector (
//   getCompaniesInitState,
//   state => state.dashboard
// );

// export const getSetupList = createSelector(
//   getCompaniesInitState,
//   state => state.setup
// );

// export const getIndustryList = createSelector(
//   getCompaniesInitState,
//   state => state.industry
// );
