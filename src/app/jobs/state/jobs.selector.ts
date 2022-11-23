import { createFeatureSelector, createSelector } from "@ngrx/store";
import { JobsState } from './jobs.reducer';

const getJobsInitState = createFeatureSelector<JobsState>('jobs');

export const loading = createSelector(
  getJobsInitState,
  state => state.loading
);

export const getJobList = createSelector(
  getJobsInitState,
  state => state.list
);

export const success = createSelector(
  getJobsInitState,
  state => state.succesMsg
);

export const getJobDetails = createSelector(
  getJobsInitState,
  state => state.selected
);
