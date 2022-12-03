import { createFeatureSelector, createSelector } from "@ngrx/store";
import { ApplicationState } from './application.reducer';

const getJobsInitState = createFeatureSelector<ApplicationState>('application');

export const loading = createSelector(
  getJobsInitState,
  state => state.loading
);

export const success = createSelector(
  getJobsInitState,
  state => state.succesMsg
);

// export const getJobList = createSelector(
//   getJobsInitState,
//   state => state.list
// );



// export const getJobDetails = createSelector(
//   getJobsInitState,
//   state => state.selected
// );
