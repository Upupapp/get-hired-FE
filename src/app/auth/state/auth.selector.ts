import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.reducer';
import * as Model from '../auth.model';
import * as AppState from '@main/state/app.reducer';

const getAuthFeatureState = createFeatureSelector<AuthState>('status');
const getCredentialsFeatureState = createFeatureSelector<AppState.State>('auth');

export const getLoading = createSelector(
  getAuthFeatureState,
  state => state.loading
);

export const getAuthCredentials = createSelector(
  getCredentialsFeatureState,
  state => state.credentials
);

export const getUserProfile = createSelector(
  getAuthFeatureState,
  state => state.profile
);

export const successMsg = createSelector(
  getAuthFeatureState,
  state => state.successMsg
);

export const errorMsg = createSelector(
  getAuthFeatureState,
  state => state.error
);
