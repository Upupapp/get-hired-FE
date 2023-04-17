import * as AppState from '@main/app.state';
import { createReducer, on } from '@ngrx/store';
import * as Model from '../jobs.model';
import * as JobActions from './jobs.actions';

export interface State extends AppState.State {
  jobs: JobsState;
}

export interface JobsState {
  selected: null;
  list: Model.BasicJob[];
  error: any;
  succesMsg: string;
  loading: boolean;
}

const initialState: JobsState  = {
  selected: null,
  list: [],
  error: null,
  succesMsg: null,
  loading: false,
}

export const jobsReducer = createReducer<JobsState>(
  initialState,
  on(JobActions.getPublishedJobList, (state, action): JobsState => {
    return {
      ...state,
      loading: true,
      error: null
    };
  }),
  on(JobActions.getPublishedJobListSuccess, (state, action): JobsState => {
    return {
      ...state,
      loading: false,
      list: action.publishedJobs
    };
  }),
  on(JobActions.getPublishedJobListFail, (state, action): JobsState => {
    return {
      ...state,
      loading: false,
      error: action.payload
    };
  }),
);
