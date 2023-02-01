import { createAction, props } from '@ngrx/store';
import * as InterviewModel from '@main/interview/interview.model';

enum AllFeatureActionTypes {


  GetApplicantJobs = '[applicantJobs] - Get applicantJobs status',
  GetApplicantJobsSuccess = '[applicantJobs] -Get applicantJobs Success',
  GetApplicantJobsFail = '[applicantJobs] - Get applicantJobs Fail',
}


export const getApplicantJobs = createAction(
  AllFeatureActionTypes.GetApplicantJobs,
  props<any>()
);

export const getApplicantJobsSuccess = createAction(
  AllFeatureActionTypes.GetApplicantJobsSuccess,
  props<{ payload: any  }>()
);

export const getApplicantJobsFail = createAction(
  AllFeatureActionTypes.GetApplicantJobsFail,
  props<{ payload: any }>()
);

