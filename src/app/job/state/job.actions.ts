import {
  createAction,
  props
} from "@ngrx/store";
import * as Model from '../job.model';
import * as InterviewModel from '@main/interview/interview.model';

enum AllFeatureActionTypes {
  GetIndustryList = '[job] - Get Industry List',
  GetIndustryListSuccess = '[job] - Get Industry List Success',
  GetIndustryListFail = '[job] - Get Industry List Fail',

  GetCategoryList = '[job] - Get Category List',
  GetCategoryListSuccess = '[job] - Get Category List Success',
  GetCategoryListFail = '[job] - Get Category List Fail',

  GetBadgeList = '[job] - Get Badge List',
  GetBadgeListSuccess = '[job] - Get Badge List Success',
  GetBadgeListFail = '[job] - Get Badge List Fail',

  GetJobRoleList = '[job] - Get Job Role List',
  GetJobRoleListSuccess = '[job] - Get Job Role List Success',
  GetJobRoleListFail = '[job] - Get Job Role List Fail',

  GetSetupList = '[job] - Get Setup List',
  GetSetupListSuccess = '[job] - Get Setup List Success',
  GetSetupListFail = '[job] - Get Setup List Fail',

  GetTypeList = '[job] - Get Type List',
  GetTypeListSuccess = '[job] - Get Type List Success',
  GetTypeListFail = '[job] - Get Type List Fail',

  GetLevelList = '[job] - Get Level List',
  GetLevelListSuccess = '[job] - Get Level List Success',
  GetLevelListFail = '[job] - Get Level List Fail',

  GetBasicJobList = '[job] - Get Basic Job List',
  GetBasicJobListSuccess = '[job] - Get Basic Job List Success',
  GetBasicJobListFail = '[job] - Get Basic Job List Fail',

  GetExpiredJobList = '[job] - Get Expired Job List',
  GetExpiredJobListSuccess = '[job] - Get Expired Job List Success',
  GetExpiredJobListFail = '[job] - Get Expired Job List Fail',

  SaveJob = '[job] - Save Job',
  SaveJobSuccess = '[job] - Save Job Success',
  SaveJobFail = '[job] - Save Job Fail',

  ChangeJobStatus = '[job] - Change Job status',
  ChangeJobStatusSuccess = '[job] - Change Job status Success',
  ChangeJobStatusFail = '[job] - Change Job status Fail',

  SetJobInitialDetails = '[job] - Set Job Initial Details',
  SetJobInfo = '[job] - Set Job Info',
  SetInterview = '[job] - Set Job Interview',
  ResetJobForm = '[job] - Reset Job Form',

  GetJob = '[job] - Get Job status',
  GetJobSuccess = '[job] -Get Job Success',
  GetJobFail = '[job] - Get Job Fail',

  GetJobApplicants = '[job] - Get Job Applicants',
  GetJobApplicantsSuccess = '[job] -Get Job Applicants Success',
  GetJobApplicantsFail = '[job] - Get Job Applicants Fail',

  GetJobApplicantDetails = '[job] - Get Job Applicant Details',
  GetJobApplicantDetailsSuccess = '[job] -Get Job Applicant Details Success',
  GetJobApplicantDetailsFail = '[job] - Get Job Applicant Details Fail',

  UpdateJobQuestion = '[job] - Update Job Question',
  UpdateJobQuestionSuccess = '[job] - Update Job Question Success',
  UpdateJobQuestionFail = '[job] - Update Job Question Fail',

  DeleteJobQuestion = '[job] - Delete Job Question',
  DeleteJobQuestionSuccess = '[job] - Delete Job Question Success',
  DeleteJobQuestionFail = '[job] - Delete Job Question Fail',

  ResetSuccessMsg = '[job] - Reset Success Message',

};

export const resetSuccessMsg = createAction(
  AllFeatureActionTypes.ResetSuccessMsg
);

export const updateJobQuestion = createAction(
  AllFeatureActionTypes.UpdateJobQuestion,
  props<{ interviewQuestion: InterviewModel.InterviewQuestion }>()
);

export const updateJobQuestionSuccess = createAction(
  AllFeatureActionTypes.UpdateJobQuestionSuccess,
  props<{ interviewQuestion: InterviewModel.InterviewQuestion }>()
);

export const updateJobQuestionFail = createAction(
  AllFeatureActionTypes.UpdateJobQuestionFail,
  props<{ payload: any }>()
);

export const deleteJobQuestion = createAction(
  AllFeatureActionTypes.DeleteJobQuestion,
  props<{ questionId: string, jobId: string }>()
);

export const deleteJobQuestionSuccess = createAction(
  AllFeatureActionTypes.DeleteJobQuestionSuccess,
  props<{ questions: InterviewModel.InterviewQuestion[] }>()
);

export const deleteJobQuestionFail = createAction(
  AllFeatureActionTypes.DeleteJobQuestionFail,
  props<{ payload: any }>()
);

export const resetJobForm = createAction(
  AllFeatureActionTypes.ResetJobForm
);

export const setJobInitialDetails = createAction(
  AllFeatureActionTypes.SetJobInitialDetails,
  props<{ initialDetails: Model.InitialDetails }>()
);

export const setJobInfo = createAction(
  AllFeatureActionTypes.SetJobInfo,
  props<{ jobInfo: Model.JobInfo }>()
);

export const setInterview = createAction(
  AllFeatureActionTypes.SetInterview,
  props<{ interview: InterviewModel.InterviewQuestion[], interviewTemplateId: string }>()
);

export const saveJob = createAction(
  AllFeatureActionTypes.SaveJob,
  props<{ job: Model.Job }>()
);

export const saveJobSuccess = createAction(
  AllFeatureActionTypes.SaveJobSuccess,
  props<{ job: Model.Job }>()
);

export const saveJobFail = createAction(
  AllFeatureActionTypes.SaveJobFail,
  props<{ payload: any }>()
);

export const changeJobStatus = createAction(
  AllFeatureActionTypes.ChangeJobStatus,
  props<{ status: number, jobId: string }>()
);

export const changeJobStatusSuccess = createAction(
  AllFeatureActionTypes.ChangeJobStatusSuccess,
  props<{ job: Model.Job }>()
);

export const changeJobStatusFail = createAction(
  AllFeatureActionTypes.ChangeJobStatusFail,
  props<{ payload: any }>()
);

// OPTIONS

export const getCategoryList = createAction(
  AllFeatureActionTypes.GetCategoryList
);

export const getCategoryListSuccess = createAction(
  AllFeatureActionTypes.GetCategoryListSuccess,
  props<{ category: Model.Options[] }>()
);

export const getCategoryListFail = createAction(
  AllFeatureActionTypes.GetCategoryListFail,
  props<{ payload: any }>()
);

export const getIndustryList = createAction(
  AllFeatureActionTypes.GetIndustryList
);

export const getIndustryListSuccess = createAction(
  AllFeatureActionTypes.GetIndustryListSuccess,
  props<{ industry: Model.Options[] }>()
);

export const getIndustryListFail = createAction(
  AllFeatureActionTypes.GetIndustryListFail,
  props<{ payload: any }>()
);

export const getBadgeList = createAction(
  AllFeatureActionTypes.GetBadgeList
);

export const getBadgeListSuccess = createAction(
  AllFeatureActionTypes.GetBadgeListSuccess,
  props<{ badge: Model.Options[] }>()
);

export const getBadgeListFail = createAction(
  AllFeatureActionTypes.GetBadgeListFail,
  props<{ payload: any }>()
);

export const getJobRoleList = createAction(
  AllFeatureActionTypes.GetJobRoleList
);

export const getJobRoleListSuccess = createAction(
  AllFeatureActionTypes.GetJobRoleListSuccess,
  props<{ jobRole: Model.Options[] }>()
);

export const getJobRoleListFail = createAction(
  AllFeatureActionTypes.GetJobRoleListFail,
  props<{ payload: any }>()
);

export const getSetupList = createAction(
  AllFeatureActionTypes.GetSetupList
);

export const getSetupListSuccess = createAction(
  AllFeatureActionTypes.GetSetupListSuccess,
  props<{ setup: Model.Options[] }>()
);

export const getSetupListFail = createAction(
  AllFeatureActionTypes.GetSetupListFail,
  props<{ payload: any }>()
);

export const getTypeList = createAction(
  AllFeatureActionTypes.GetTypeList
);

export const getTypeListSuccess = createAction(
  AllFeatureActionTypes.GetTypeListSuccess,
  props<{ typeList: Model.Options[] }>()
);

export const getTypeListFail = createAction(
  AllFeatureActionTypes.GetTypeListFail,
  props<{ payload: any }>()
);

export const getLevelList = createAction(
  AllFeatureActionTypes.GetLevelList
);

export const getLevelListSuccess = createAction(
  AllFeatureActionTypes.GetLevelListSuccess,
  props<{ level: Model.Options[] }>()
);

export const getLevelListFail = createAction(
  AllFeatureActionTypes.GetLevelListFail,
  props<{ payload: any }>()
);

export const getBasicJobList = createAction(
  AllFeatureActionTypes.GetBasicJobList,
  props<{ companyId: string }>()
);

export const getBasicJobListSuccess = createAction(
  AllFeatureActionTypes.GetBasicJobListSuccess,
  props<{ basicList: Model.BasicList[] }>()
);

export const getBasicJobListFail = createAction(
  AllFeatureActionTypes.GetBasicJobListFail,
  props<{ payload: any }>()
);

export const getExpiredJobList = createAction(
  AllFeatureActionTypes.GetExpiredJobList,
  props<{ companyId: string }>()
);

export const getExpiredJobListSuccess = createAction(
  AllFeatureActionTypes.GetExpiredJobListSuccess,
  props<{ expiredList: Model.BasicList[] }>()
);

export const getExpiredJobListFail = createAction(
  AllFeatureActionTypes.GetExpiredJobListFail,
  props<{ payload: any }>()
);

export const getJob = createAction(
  AllFeatureActionTypes.GetJob,
  props<{ jobId: any }>()
);

export const getJobSuccess = createAction(
  AllFeatureActionTypes.ChangeJobStatusSuccess,
  props<{ job: Model.Job }>()
);

export const getJobFail = createAction(
  AllFeatureActionTypes.ChangeJobStatusFail,
  props<{ payload: any }>()
);

export const getJobApplicants = createAction(
  AllFeatureActionTypes.GetJobApplicants,
  props<{ jobId: any }>()
);

export const getJobApplicantsSuccess = createAction(
  AllFeatureActionTypes.GetJobApplicantsSuccess,
  props<{ applicants: Model.JobApplicants[] }>()
);

export const getJobApplicantsFail = createAction(
  AllFeatureActionTypes.GetJobApplicantsFail,
  props<{ payload: any }>()
);

export const getJobApplicantDetails = createAction(
  AllFeatureActionTypes.GetJobApplicantDetails,
  props<{ jobId: string, userId: string }>()
);

export const getJobApplicantDetailsSuccess = createAction(
  AllFeatureActionTypes.GetJobApplicantDetailsSuccess,
  props<{ applicant: Model.JobApplicantDetails }>()
);

export const getJobApplicantDetailsFail = createAction(
  AllFeatureActionTypes.GetJobApplicantDetailsFail,
  props<{ payload: any }>()
);
