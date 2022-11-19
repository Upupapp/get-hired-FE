import { createFeatureSelector, createSelector } from "@ngrx/store";
import { JobState } from './job.reducer';

const getJobInitState = createFeatureSelector<JobState>('job');

export const loading = createSelector(
  getJobInitState,
  state => state.loading
);

export const getJobList = createSelector(
  getJobInitState,
  state => state.list
);

export const success = createSelector(
  getJobInitState,
  state => state.succesMsg
);

export const getJobDetails = createSelector(
  getJobInitState,
  state => state.selected
);

export const getIndustryList = createSelector(
  getJobInitState,
  state => state.industry
);

export const getBadgeList = createSelector(
  getJobInitState,
  state => state.badge
);

export const getJobRoleList = createSelector(
  getJobInitState,
  state => state.jobRole
);

export const getSetupList = createSelector(
  getJobInitState,
  state => state.setup
);

export const getTypeList = createSelector(
  getJobInitState,
  state => state.typeList
);

export const getLevelList = createSelector(
  getJobInitState,
  state => state.level
);

export const getCategoryList = createSelector(
  getJobInitState,
  state => state.category
);

export const getIntialDetails = createSelector(
  getJobInitState,
  state => state.initialDetails
);

export const getJobInfo = createSelector(
  getJobInitState,
  state => state.jobInfo
);

export const getJobInterview = createSelector(
  getJobInitState,
  state => state.interview
);

export const getJobPreview = createSelector(
  getJobInitState,
  state => ({
    industry: state.industry,
    jobRole: state.jobRole,
    setup: state.setup,
    typeList: state.typeList,
    level: state.level,
    initialDetails: state.initialDetails,
    jobInfo: state.jobInfo,
    interview: state.interview
  })
);

