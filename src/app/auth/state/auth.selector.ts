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

export const successThrow = createSelector(
  getAuthFeatureState,
  state => state.success
);

export const errorMsg = createSelector(
  getAuthFeatureState,
  state => state.error
);
