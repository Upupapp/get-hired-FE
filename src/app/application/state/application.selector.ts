import { createFeatureSelector, createSelector } from "@ngrx/store";
import { ApplicationState } from './application.reducer';

const getApplicationInitState = createFeatureSelector<ApplicationState>('application');

export const loading = createSelector(
  getApplicationInitState,
  state => state.loading
);

export const success = createSelector(
  getApplicationInitState,
  state => state.succesMsg
);

// LAUNCH-01: error selectors for inline error/duplicate feedback
export const getError = createSelector(
  getApplicationInitState,
  state => state.error
);

export const getErrorCode = createSelector(
  getApplicationInitState,
  state => state.errorCode
);

// LAUNCH-01: combined selector so the component can subscribe once
// and handle success, error, and duplicate in a single callback.
export const getSubmitResult = createSelector(
  getApplicationInitState,
  state => ({
    success: state.succesMsg,
    error: state.error,
    errorCode: state.errorCode,
  })
);

export const getApplicationDetails = createSelector(
  getApplicationInitState,
  state => state.selected
);
