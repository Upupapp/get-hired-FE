import * as AppState from '@main/app.state';
import { createReducer, on } from '@ngrx/store';
import * as Model from '../admin.model';
import * as AdminActions from './admin.actions';
import * as InterviewModel from '@main/interview/interview.model';

export interface State extends AppState.State {
  admin: AdminState;
}

export interface AdminState {
  selected: Model.Admin;
  list: Model.Admin[];
  error: any;
  succesMsg: string;
  loading: boolean;
  user: Model.User;
  dashboard
  // admin: Model.Admin | null;
  // adminLoading: boolean
}

const initialState: AdminState = {
  selected: null,
  list: [],
  error: null,
  succesMsg: null,
  loading: false,
  user: null,
  dashboard: []
  // adminLoading: false
};

export const adminReducer = createReducer<AdminState>(
  initialState,
  on(AdminActions.getUserProfile, (state): AdminState => {
    return {
      ...state,
      loading: true,
      succesMsg: null,
    };
  }),
  on(AdminActions.getUserProfileSuccess, (state, action): AdminState => {
    return {
      ...state,
      user: action.user,
      loading: false,
    };
  }),
  on(AdminActions.getUserProfileFail, (state, action): AdminState => {
    return {
      ...state,
      loading: false,
      error: action.payload,
      succesMsg: null,
    };
  }),
  on(AdminActions.getAdmin, (state): AdminState => {
    return {
      ...state,
      loading: true,
      succesMsg: null,
    };
  }),
  on(AdminActions.getAdminSuccess, (state, action): AdminState => {
    return {
      ...state,
      selected: action.admin,
      loading: false,
    };
  }),
  on(AdminActions.getAdminFail, (state, action): AdminState => {
    return {
      ...state,
      loading: false,
      error: action.payload,
      succesMsg: null,
    };
  }),
  on(AdminActions.adminDashboard, (state): AdminState => {
    return {
      ...state,
      loading: true,
      error: null,
      succesMsg: null
    };
  }),
  on(AdminActions.adminDashboardSuccess, (state, action): AdminState => {
    return {
      ...state,
      loading: false,
      dashboard: action.dashboard
    };
  }),
  on(AdminActions.adminDashboardFail, (state, action): AdminState => {
    return {
      ...state,
      loading: false,
      error: action.payload
    };
  }),
);
