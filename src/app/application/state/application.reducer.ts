import * as AppState from '@main/app.state';
import { createReducer, on } from '@ngrx/store';
import * as Model from '../application.model';
import * as JobActions from './application.actions';

export interface State extends AppState.State {
  Applications: ApplicationState;
}

export interface ApplicationState {
  selected: null;
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
  // on(JobActions.getPublishedJobList, (state, action): ApplicationState => {
  //   return {
  //     ...state,
  //     loading: false,
  //     error: null
  //   };
  // }),
  // on(JobActions.getPublishedJobListSuccess, (state, action): ApplicationState => {
  //   return {
  //     ...state,
  //     loading: false,
  //     list: action.publishedApplication
  //   };
  // }),
  // on(JobActions.getPublishedJobListFail, (state, action): ApplicationState => {
  //   return {
  //     ...state,
  //     loading: false,
  //     error: action.payload
  //   };
  // }),
);
