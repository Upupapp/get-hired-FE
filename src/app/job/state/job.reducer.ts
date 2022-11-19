import * as AppState from '@main/app.state';
import { createReducer, on } from '@ngrx/store';
import * as Model from '../job.model';
import * as JobActions from './job.actions';
import * as InterviewModel from '@main/interview/interview.model';

export interface State extends AppState.State {
  job: JobState;
}

export interface JobState {
  selected: Model.Job | null;
  list: Model.Job[] | Model.BasicList[];
  error: any;
  succesMsg: string;
  loading: boolean;
  industry: Model.Options[];
  badge: Model.Options[];
  jobRole: Model.Options[];
  setup: Model.Options[];
  typeList: Model.Options[];
  level: Model.Options[];
  category: Model.Options[];
  initialDetails: Model.InitialDetails;
  jobInfo: Model.JobInfo;
  interview: InterviewModel.InterviewQuestion[]
}

const initialState: JobState  = {
  selected: null,
  list: [],
  error: null,
  succesMsg: null,
  loading: false,
  industry: [],
  badge: [],
  jobRole: [],
  setup: [],
  typeList: [],
  level: [],
  category: [],
  initialDetails: null,
  jobInfo: null,
  interview: []
}

export const jobReducer = createReducer<JobState>(
  initialState,
  on(JobActions.saveJob, (state): JobState => {
    return {
      ...state,
      loading: true,
      succesMsg: null
    };
  }),
  on(JobActions.saveJobSuccess, (state, action): JobState => {
    return {
      ...state,
      selected: action.job,
      loading: false,
      succesMsg: action.job.jobStatusId == 1 ? 'asDraft': 'published'
    };
  }),
  on(JobActions.saveJobFail, (state, action): JobState => {
    return {
      ...state,
      loading: false,
      error: action.payload,
      succesMsg: null
    };
  }),
  on(JobActions.setJobInitialDetails, (state, action): JobState => {
    return {
      ...state,
      initialDetails: {
        ...action.initialDetails,
        jobTypeId: action.initialDetails.jobTypeId as number,
        jobLevelId: action.initialDetails.jobLevelId as number,
        jobCategoryId: action.initialDetails.jobCategoryId as number,
        workSetupId: action.initialDetails.workSetupId as number
      }
    };
  }),
  on(JobActions.setJobInfo, (state, action): JobState => {
    return {
      ...state,
      jobInfo: action.jobInfo
    };
  }),
  on(JobActions.getBasicJobList, (state): JobState => {
    return {
      ...state,
      loading: true
    };
  }),
  on(JobActions.getBasicJobListSuccess, (state, action): JobState => {
    return {
      ...state,
      loading: false,
      list: action.basicList,
      error: null,
    };
  }),
  on(JobActions.getBasicJobListFail, (state, action): JobState => {
    return {
      ...state,
      loading: false,
      error: action.payload
    };
  }),
  on(JobActions.getExpiredJobList, (state): JobState => {
    return {
      ...state,
      loading: true
    };
  }),
  on(JobActions.getExpiredJobListSuccess, (state, action): JobState => {
    return {
      ...state,
      loading: false,
      list: action.expiredList,
      error: null,
    };
  }),
  on(JobActions.getExpiredJobListFail, (state, action): JobState => {
    return {
      ...state,
      loading: false,
      error: action.payload
    };
  }),
  on(JobActions.getCategoryList, (state): JobState => {
    return {
      ...state,
      loading: true
    };
  }),
  on(JobActions.getCategoryListSuccess, (state, action): JobState => {
    return {
      ...state,
      loading: false,
      category: action.category,
      error: null,
    };
  }),
  on(JobActions.getCategoryListFail, (state, action): JobState => {
    return {
      ...state,
      loading: false,
      error: action.payload
    };
  }),
  on(JobActions.getIndustryList, (state): JobState => {
    return {
      ...state,
      loading: true
    };
  }),
  on(JobActions.getIndustryListSuccess, (state, action): JobState => {
    return {
      ...state,
      loading: false,
      industry: action.industry,
      error: null,
    };
  }),
  on(JobActions.getIndustryListFail, (state, action): JobState => {
    return {
      ...state,
      loading: false,
      error: action.payload
    };
  }),
  on(JobActions.getBadgeList, (state): JobState => {
    return {
      ...state,
      loading: true
    };
  }),
  on(JobActions.getBadgeListSuccess, (state, action): JobState => {
    return {
      ...state,
      loading: false,
      badge: action.badge,
      error: null,
    };
  }),
  on(JobActions.getBadgeListFail, (state, action): JobState => {
    return {
      ...state,
      loading: false,
      error: action.payload
    };
  }),
  on(JobActions.getJobRoleList, (state): JobState => {
    return {
      ...state,
      loading: true
    };
  }),
  on(JobActions.getJobRoleListSuccess, (state, action): JobState => {
    return {
      ...state,
      loading: false,
      jobRole: action.jobRole,
      error: null,
    };
  }),
  on(JobActions.getJobRoleListFail, (state, action): JobState => {
    return {
      ...state,
      loading: false,
      error: action.payload
    };
  }),
  on(JobActions.getSetupList, (state): JobState => {
    return {
      ...state,
      loading: true
    };
  }),
  on(JobActions.getSetupListSuccess, (state, action): JobState => {
    return {
      ...state,
      loading: false,
      setup: action.setup,
      error: null,
    };
  }),
  on(JobActions.getSetupListFail, (state, action): JobState => {
    return {
      ...state,
      loading: false,
      error: action.payload
    };
  }),
  on(JobActions.getTypeList, (state): JobState => {
    return {
      ...state,
      loading: true
    };
  }),
  on(JobActions.getTypeListSuccess, (state, action): JobState => {
    return {
      ...state,
      loading: false,
      typeList: action.typeList,
      error: null,
    };
  }),
  on(JobActions.getTypeListFail, (state, action): JobState => {
    return {
      ...state,
      loading: false,
      error: action.payload
    };
  }),
  on(JobActions.getLevelList, (state): JobState => {
    return {
      ...state,
      loading: true
    };
  }),
  on(JobActions.getLevelListSuccess, (state, action): JobState => {
    return {
      ...state,
      loading: false,
      level: action.level,
      error: null,
    };
  }),
  on(JobActions.getLevelListFail, (state, action): JobState => {
    return {
      ...state,
      loading: false,
      error: action.payload
    };
  }),
);
