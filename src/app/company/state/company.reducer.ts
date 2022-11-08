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
}

const initialState: CompanyState = {
  selected: null,
  list: [],
  succesMsg: '',
  error: null,
  loading: false,
};

export const companyReducer = createReducer<CompanyState>(
  initialState,
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
      succesMsg: 'created'
    };
  }),
  on(CompanyActions.createCompanyFail, (state, action): CompanyState => {
    return {
      ...state,
      loading: false,
      error: action.payload
    };
  })
);
