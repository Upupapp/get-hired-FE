import * as AppState from '@main/app.state';
import { createReducer, on } from '@ngrx/store';
import * as Model from '../companies.model';
import * as CompanyActions from './companies.actions';

export interface State extends AppState.State {
  companies: CompaniesState;
}

export interface CompaniesState {
  selected: Model.Company;
  all: Model.Company[];
  list: Model.BasicInfo[];
  error: any;
  succesMsg: string;
  loading: boolean;
}

const initialState: CompaniesState = {
  selected: null,
  all: [],
  list: [],
  succesMsg: '',
  error: null,
  loading: false
};

export const companiesReducer = createReducer<CompaniesState>(
  initialState,
  on(CompanyActions.resetState, (state): CompaniesState => {
    return {
      ...state,
      succesMsg: '',
      error: null,
      loading: false
    };
  }),
  on(CompanyActions.getAllcompany, (state): CompaniesState => {
    return {
      ...state,
      loading: true
    };
  }),
  on(CompanyActions.getAllcompanySuccess, (state, action): CompaniesState => {
    return {
      ...state,
      loading: false,
      list: action.company,
      error: null
    };
  }),
  on(CompanyActions.getAllcompanyFail, (state, action): CompaniesState => {
    return {
      ...state,
      loading: false,
      error: action.payload
    };
  }),
  on(CompanyActions.getAllFeaturedCompany, (state): CompaniesState => {
    return {
      ...state,
      loading: true,
      error: null,
      succesMsg: null
    };
  }),
  on(CompanyActions.getAllFeaturedCompanySuccess, (state, action): CompaniesState => {
    return {
      ...state,
      loading: false,
      list: action.company
    };
  }),
  on(CompanyActions.getAllFeaturedCompanyFail, (state, action): CompaniesState => {
    return {
      ...state,
      loading: false,
      error: action.payload
    };
  }),
  on(CompanyActions.getCompany, (state): CompaniesState => {
    return {
      ...state,
      loading: true,
      error: null,
      succesMsg: null
    };
  }),
  on(CompanyActions.getCompanySuccess, (state, action): CompaniesState => {
    return {
      ...state,
      loading: false,
      selected: action.company
    };
  }),
  on(CompanyActions.getCompanyFail, (state, action): CompaniesState => {
    return {
      ...state,
      loading: false,
      error: action.payload
    };
  }),
)
