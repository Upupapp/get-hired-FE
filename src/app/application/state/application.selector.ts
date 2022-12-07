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

// export const getJobList = createSelector(
//   getApplicationInitState,
//   state => state.list
// );



export const getApplicationDetails = createSelector(
  getApplicationInitState,
  state => state.selected
);
