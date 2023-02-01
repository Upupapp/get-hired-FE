import * as AppState from '@main/app.state';
import { createReducer, on } from '@ngrx/store';
import * as ApplicantJobsActions from './applicant-jobs.actions';
import * as InterviewModel from '@main/interview/interview.model';

export interface State extends AppState.State {
  applicantJobs: ApplicantJobsState;
}

export interface ApplicantJobsState {
  applicantJobs: any[];
  error: any;
  success: any;
  loading: boolean;
}

const initialState: ApplicantJobsState = {
  applicantJobs: [],
  error: null,
  success: null,
  loading: false
};

export const applicantJobsReducer = createReducer<ApplicantJobsState>(
  initialState,
  on(ApplicantJobsActions.getApplicantJobs, (state): ApplicantJobsState => {
    return {
      ...state,
      loading: true,
      success: null,
    };
  }),
  on(ApplicantJobsActions.getApplicantJobsSuccess, (state, action: any): ApplicantJobsState => {
    return {
      ...state,
      applicantJobs: action.payload,
      loading: false,
    };
  }),
  on(ApplicantJobsActions.getApplicantJobsFail, (state, action): ApplicantJobsState => {
    return {
      ...state,
      loading: false,
      error: action.payload,
      success: null,
    };
  }),
);
