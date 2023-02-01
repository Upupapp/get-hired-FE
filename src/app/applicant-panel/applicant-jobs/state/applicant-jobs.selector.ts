import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ApplicantJobsState } from './applicant-jobs.reducer';

const getApplicantInitState =
  createFeatureSelector<ApplicantJobsState>('applicant');

export const loading = createSelector(
  getApplicantInitState,
  (state) => state.loading
);

export const getApplicantJobs = createSelector(
  getApplicantInitState,
  (state) => state.applicantJobs
);

export const success = createSelector(
  getApplicantInitState,
  state => state.success
);
