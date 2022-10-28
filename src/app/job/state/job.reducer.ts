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

export const invoiceReducer = createReducer<JobState>(
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
);
