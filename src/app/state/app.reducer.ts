import { createReducer, on } from '@ngrx/store';
import * as AppActions from "./app.actions";
import * as Model from '../app.model';
import * as AppState from '@main/app.state';

export interface State extends AppState.State {
  loading: boolean;
  credentials: Model.Credentials;
}

const initAuth = {
  firstName: '',
  lastName: '',
  email: '',
}

const initialState: State = {
  loading: false,
  credentials: {
    ...initAuth
  }
}

export const credentialReducer = createReducer<State>(
  initialState,
  on(AppActions.resetAuthCredentials, (state): State => {
    return {
      ...state,
      loading: false,
      credentials: { ...initAuth }
    };
  }),
  on(AppActions.refreshAuthCredentials, (state): State => {
    console.log(state);
    return {
      ...state,
      loading: true
    };
  }),
  on(AppActions.refreshAuthCredentialsSuccess, (state, action): State => {
    return {
      ...state,
      loading: false,
      credentials: action.credentials
    };
  }),
  on(AppActions.refreshAuthCredentialsFail, (state, action): State => {
    return {
      ...state,
      loading: false
    };
  }),
);
