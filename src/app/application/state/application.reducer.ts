import * as AppState from '@main/app.state';
import { createReducer, on } from '@ngrx/store';
import * as Model from '../application.model';
import * as ApplicationActions from './application.actions';

export interface State extends AppState.State {
  Applications: ApplicationState;
}

export interface ApplicationState {
  selected: Model.Application;
  // list: Model.BasicJob[];
  error: any;
  // LAUNCH-01: error code so the FE can distinguish 409 (duplicate) from 5xx (server error)
  errorCode: string | null;
  succesMsg: string;
  loading: boolean;
}

const initialState: ApplicationState  = {
  selected: null,
  // list: [],
  error: null,
  errorCode: null,
  succesMsg: null,
  loading: false,
}

export const ApplicationsReducer = createReducer<ApplicationState>(
  initialState,
  on(ApplicationActions.resetApplication, (state, action): ApplicationState => {
    return {
      ...state,
      loading: false,
      error: null,
      errorCode: null,
      selected: null
    };
  }),
  on(ApplicationActions.submitApplication, (state, action): ApplicationState => {
    return {
      ...state,
      loading: true,
      error: null,
      errorCode: null
    };
  }),
  on(ApplicationActions.submitApplicationSuccess, (state, action): ApplicationState => {
    return {
      ...state,
      loading: false,
      selected: action.application,
      succesMsg: 'submitted',
      error: null,
      errorCode: null
    };
  }),
  on(ApplicationActions.submitApplicationFail, (state, action): ApplicationState => {
    return {
      ...state,
      loading: false,
      error: action.payload,
      errorCode: action.errorCode || null
    };
  }),
);
