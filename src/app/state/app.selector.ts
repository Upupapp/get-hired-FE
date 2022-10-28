import { createFeatureSelector, createSelector,  } from "@ngrx/store";
import { State } from './app.reducer';

const getAppState = createFeatureSelector<State>('auth');

export const getAuthCredentials = createSelector(
  getAppState,
  state => state.credentials
);
