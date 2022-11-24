import * as AppState from '@main/app.state';
import { createReducer, on } from '@ngrx/store';
import * as Model from '../company.model';
import * as CompanyActions from './company.actions';

export interface State extends AppState.State {
  company: CompanyState;
}

export interface CompanyState {
  selected: Model.Company;
  list: Model.Company[];
  error: any;
  succesMsg: string;
  loading: boolean;
  dashboard: Model.Dashboard;
  setup: Model.Options[];
  industry: Model.Options[];
  users: Model.CompanyUser[];
}

const initialState: CompanyState = {
  selected: null,
  list: [],
  succesMsg: '',
  error: null,
  loading: false,
  dashboard: null,
  setup: [],
  industry: [],
  users: []
};

export const companyReducer = createReducer<CompanyState>(
  initialState,
  on(CompanyActions.resetState, (state): CompanyState => {
    return {
      ...state,
      succesMsg: '',
      error: null,
      loading: false
    };
  }),
  on(CompanyActions.getAllcompany, (state): CompanyState => {
    return {
      ...state,
      loading: true
    };
  }),
  on(CompanyActions.getAllcompanySuccess, (state, action): CompanyState => {
    return {
      ...state,
      loading: false,
      list: action.company,
      error: null
    };
  }),
  on(CompanyActions.getAllcompanyFail, (state, action): CompanyState => {
    return {
      ...state,
      loading: false,
      error: action.payload
    };
  }),
  on(CompanyActions.createCompany, (state): CompanyState => {
    return {
      ...state,
      loading: true,
      error: null,
      succesMsg: null
    };
  }),
  on(CompanyActions.createCompanySuccess, (state, action): CompanyState => {
    return {
      ...state,
      loading: false,
      succesMsg: 'created',
      selected: action.company
    };
  }),
  on(CompanyActions.createCompanyFail, (state, action): CompanyState => {
    return {
      ...state,
      loading: false,
      error: action.payload
    };
  }),
  on(CompanyActions.getCompanyUsers, (state): CompanyState => {
    return {
      ...state,
      loading: true,
      error: null,
      succesMsg: null
    };
  }),
  on(CompanyActions.getCompanyUsersSuccess, (state, action): CompanyState => {
    return {
      ...state,
      loading: false,
      users: action.users
    };
  }),
  on(CompanyActions.getCompanyUsersFail, (state, action): CompanyState => {
    return {
      ...state,
      loading: false,
      error: action.payload
    };
  }),
  on(CompanyActions.getCompany, (state): CompanyState => {
    return {
      ...state,
      loading: true,
      error: null,
      succesMsg: null
    };
  }),
  on(CompanyActions.getCompanySuccess, (state, action): CompanyState => {
    return {
      ...state,
      loading: false,
      selected: action.company
    };
  }),
  on(CompanyActions.getCompanyFail, (state, action): CompanyState => {
    return {
      ...state,
      loading: false,
      error: action.payload
    };
  }),
  on(CompanyActions.updateCompany, (state): CompanyState => {
    return {
      ...state,
      loading: true,
      error: null,
      succesMsg: null
    };
  }),
  on(CompanyActions.updateCompanySuccess, (state, action): CompanyState => {
    return {
      ...state,
      loading: false,
      succesMsg: 'updated',
      selected: action.company
    };
  }),
  on(CompanyActions.updateCompanyFail, (state, action): CompanyState => {
    return {
      ...state,
      loading: false,
      error: action.payload
    };
  }),
  on(CompanyActions.companyDashboard, (state): CompanyState => {
    return {
      ...state,
      loading: true,
      error: null,
      succesMsg: null
    };
  }),
  on(CompanyActions.companyDashboardSuccess, (state, action): CompanyState => {
    return {
      ...state,
      loading: false,
      dashboard: action.dashboard
    };
  }),
  on(CompanyActions.companyDashboardFail, (state, action): CompanyState => {
    return {
      ...state,
      loading: false,
      error: action.payload
    };
  }),
);
