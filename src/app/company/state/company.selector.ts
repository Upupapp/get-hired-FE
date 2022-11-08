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

