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
  succesMsg: string;
  loading: boolean;
}

const initialState: ApplicationState  = {
  selected: null,
  // list: [],
  error: null,
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
      selected: null
    };
  }),
  on(ApplicationActions.submitApplication, (state, action): ApplicationState => {
    return {
      ...state,
      loading: true,
      error: null
    };
  }),
  on(ApplicationActions.submitApplicationSuccess, (state, action): ApplicationState => {
    return {
      ...state,
      loading: false,
      selected: action.application,
      succesMsg: 'submitted'
    };
  }),
  on(ApplicationActions.submitApplicationFail, (state, action): ApplicationState => {
    return {
      ...state,
      loading: false,
      error: action.payload
    };
  }),
);
