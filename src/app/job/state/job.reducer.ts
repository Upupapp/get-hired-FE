import * as AppState from '@main/app.state';
import { createReducer, on } from '@ngrx/store';
import * as Model from '../job.model';
import * as JobActions from './job.actions';

export interface State extends AppState.State {
  job: JobState;
}

export interface JobState {
  selected: Model.Job | null;
  list: Model.Job[];
  error: any;
  succesMsg: string;
  loading: boolean;
  industry: Model.Options[];
  badge: Model.Options[];
  jobRole: Model.Options[];
  setup: Model.Options[];
  typeList: Model.Options[];
  level: Model.Options[];
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
  level: []
}

export const jobReducer = createReducer<JobState>(
  initialState,
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
