import * as AppState from '@main/app.state';
import * as Model from '../auth.model';
import * as AuthActions from './auth.actions';
import { createReducer, on } from '@ngrx/store';

export interface State extends AppState.State {
  status: AuthState
}

export interface AuthState {
  success: boolean;
  error?: any;
  loading: boolean;
  credentials: Model.Credentials
}

const initialState: AuthState = {
  success: false,
  error: null,
  loading: false,
  credentials: null
}

export const authReducer = createReducer<AuthState>(
  initialState,
  on(AuthActions.resetCredentials, (state): AuthState => {
    return {
      ...initialState
    };
  }),
  on(AuthActions.getAuthCredentials, (state): AuthState => {
    return {
      ...state,
      loading: true,
      error: null
    };
  }),
  on(AuthActions.getAuthCredentialsSuccess, (state, action): AuthState => {
    return {
      ...state,
      loading: false,
      error: null
    };
  }),
  on(AuthActions.getAuthCredentialsFail, (state, action): AuthState => {
    return {
      ...state,
      loading: false,
      error: action.payload || "Network Failed"
    };
  }),
  on(AuthActions.createAuthCredentials, (state): AuthState => {
    return {
      ...state,
      loading: true
    };
  }),
  on(AuthActions.createAuthCredentialsSuccess, (state, action): AuthState => {
    return {
      ...state,
      loading: false,
      success: true,
      credentials: action.credentials
    };
  }),
  on(AuthActions.createAuthCredentialsFail, (state, action): AuthState => {
    return {
      ...state,
      loading: false,
      error: action.payload
    };
  }),
);
