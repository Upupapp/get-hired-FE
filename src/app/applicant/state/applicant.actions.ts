import { createAction, props } from '@ngrx/store';
import * as Model from '../applicant.model';
import * as InterviewModel from '@main/interview/interview.model';

enum AllFeatureActionTypes {
  GetApplicant = '[applicant] - Get Applicant status',
  GetApplicantSuccess = '[applicant] -Get Applicant Success',
  GetApplicantFail = '[applicant] - Get Applicant Fail',

  SetInitialDetails = '[applicant] - Set Initial Details',
  SetProfileArrays = '[applicant] - Set Initial Details',
  SetProfileDocuments = '[applicant] - Set Profile Documents'

  // GetIndustryList = '[applicant] - Get Industry List',
  // GetIndustryListSuccess = '[applicant] - Get Industry List Success',
  // GetIndustryListFail = '[applicant] - Get Industry List Fail',

  // GetCategoryList = '[applicant] - Get Category List',
  // GetCategoryListSuccess = '[applicant] - Get Category List Success',
  // GetCategoryListFail = '[applicant] - Get Category List Fail',

  // GetBadgeList = '[applicant] - Get Badge List',
  // GetBadgeListSuccess = '[applicant] - Get Badge List Success',
  // GetBadgeListFail = '[applicant] - Get Badge List Fail',

  // GetApplicantRoleList = '[applicant] - Get Applicant Role List',
  // GetApplicantRoleListSuccess = '[applicant] - Get Applicant Role List Success',
  // GetApplicantRoleListFail = '[applicant] - Get Applicant Role List Fail',

  // GetSetupList = '[applicant] - Get Setup List',
  // GetSetupListSuccess = '[applicant] - Get Setup List Success',
  // GetSetupListFail = '[applicant] - Get Setup List Fail',

  // GetTypeList = '[applicant] - Get Type List',
  // GetTypeListSuccess = '[applicant] - Get Type List Success',
  // GetTypeListFail = '[applicant] - Get Type List Fail',

  // GetLevelList = '[applicant] - Get Level List',
  // GetLevelListSuccess = '[applicant] - Get Level List Success',
  // GetLevelListFail = '[applicant] - Get Level List Fail',

  // GetBasicApplicantList = '[applicant] - Get Basic Applicant List',
  // GetBasicApplicantListSuccess = '[applicant] - Get Basic Applicant List Success',
  // GetBasicApplicantListFail = '[applicant] - Get Basic Applicant List Fail',

  // GetExpiredApplicantList = '[applicant] - Get Expired Applicant List',
  // GetExpiredApplicantListSuccess = '[applicant] - Get Expired Applicant List Success',
  // GetExpiredApplicantListFail = '[applicant] - Get Expired Applicant List Fail',

  // SaveApplicant = '[applicant] - Save Applicant',
  // SaveApplicantSuccess = '[applicant] - Save Applicant Success',
  // SaveApplicantFail = '[applicant] - Save Applicant Fail',

  // ChangeApplicantStatus = '[applicant] - Change Applicant status',
  // ChangeApplicantStatusSuccess = '[applicant] - Change Applicant status Success',
  // ChangeApplicantStatusFail = '[applicant] - Change Applicant status Fail',

  // SetApplicantInitialDetails = '[applicant] - Set Applicant Initial Details',
  // SetApplicantInfo = '[applicant] - Set Applicant Info',
  // SetInterview = '[applicant] - Set Applicant Interview',
  // ResetApplicantForm = '[applicant] - Reset Applicant Form',
}

export const getApplicant = createAction(
  AllFeatureActionTypes.GetApplicant,
  props<{ applicantId: any }>()
);

export const getApplicantSuccess = createAction(
  AllFeatureActionTypes.GetApplicantSuccess,
  props<{ applicant: Model.Applicant }>()
);

export const getApplicantFail = createAction(
  AllFeatureActionTypes.GetApplicantFail,
  props<{ payload: any }>()
);

export const setInitialDetails = createAction(
  AllFeatureActionTypes.GetApplicant,
  props<{ initialDetails: Model.InitialDetails}>()
);

// export const resetApplicantForm = createAction(
//   AllFeatureActionTypes.ResetApplicantForm
// );

// export const setApplicantInitialDetails = createAction(
//   AllFeatureActionTypes.SetApplicantInitialDetails,
//   props<{ initialDetails: Model.InitialDetails }>()
// );

// export const setApplicantInfo = createAction(
//   AllFeatureActionTypes.SetApplicantInfo,
//   props<{ applicantInfo: Model.ApplicantInfo }>()
// );

// export const setInterview = createAction(
//   AllFeatureActionTypes.SetInterview,
//   props<{ interview: InterviewModel.InterviewQuestion[] }>()
// );

// export const saveApplicant = createAction(
//   AllFeatureActionTypes.SaveApplicant,
//   props<{ applicant: Model.Applicant }>()
// );

// export const saveApplicantSuccess = createAction(
//   AllFeatureActionTypes.SaveApplicantSuccess,
//   props<{ applicant: Model.Applicant }>()
// );

// export const saveApplicantFail = createAction(
//   AllFeatureActionTypes.SaveApplicantFail,
//   props<{ payload: any }>()
// );

// export const changeApplicantStatus = createAction(
//   AllFeatureActionTypes.ChangeApplicantStatus,
//   props<{ status: number, applicantId: string  }>()
// );

// export const changeApplicantStatusSuccess = createAction(
//   AllFeatureActionTypes.ChangeApplicantStatusSuccess,
//   props<{ applicant: Model.Applicant }>()
// );

// export const changeApplicantStatusFail = createAction(
//   AllFeatureActionTypes.ChangeApplicantStatusFail,
//   props<{ payload: any }>()
// );

// // OPTIONS

// export const getCategoryList = createAction(
//   AllFeatureActionTypes.GetCategoryList
// );

// export const getCategoryListSuccess = createAction(
//   AllFeatureActionTypes.GetCategoryListSuccess,
//   props<{ category: Model.Options[] }>()
// );

// export const getCategoryListFail = createAction(
//   AllFeatureActionTypes.GetCategoryListFail,
//   props<{ payload: any }>()
// );

// export const getIndustryList = createAction(
//   AllFeatureActionTypes.GetIndustryList
// );

// export const getIndustryListSuccess = createAction(
//   AllFeatureActionTypes.GetIndustryListSuccess,
//   props<{ industry: Model.Options[] }>()
// );

// export const getIndustryListFail = createAction(
//   AllFeatureActionTypes.GetIndustryListFail,
//   props<{ payload: any }>()
// );

// export const getBadgeList = createAction(
//   AllFeatureActionTypes.GetBadgeList
// );

// export const getBadgeListSuccess = createAction(
//   AllFeatureActionTypes.GetBadgeListSuccess,
//   props<{ badge: Model.Options[] }>()
// );

// export const getBadgeListFail = createAction(
//   AllFeatureActionTypes.GetBadgeListFail,
//   props<{ payload: any }>()
// );

// export const getApplicantRoleList = createAction(
//   AllFeatureActionTypes.GetApplicantRoleList
// );

// export const getApplicantRoleListSuccess = createAction(
//   AllFeatureActionTypes.GetApplicantRoleListSuccess,
//   props<{ applicantRole: Model.Options[] }>()
// );

// export const getApplicantRoleListFail = createAction(
//   AllFeatureActionTypes.GetApplicantRoleListFail,
//   props<{ payload: any }>()
// );

// export const getSetupList = createAction(
//   AllFeatureActionTypes.GetSetupList
// );

// export const getSetupListSuccess = createAction(
//   AllFeatureActionTypes.GetSetupListSuccess,
//   props<{ setup: Model.Options[] }>()
// );

// export const getSetupListFail = createAction(
//   AllFeatureActionTypes.GetSetupListFail,
//   props<{ payload: any }>()
// );

// export const getTypeList = createAction(
//   AllFeatureActionTypes.GetTypeList
// );

// export const getTypeListSuccess = createAction(
//   AllFeatureActionTypes.GetTypeListSuccess,
//   props<{ typeList: Model.Options[] }>()
// );

// export const getTypeListFail = createAction(
//   AllFeatureActionTypes.GetTypeListFail,
//   props<{ payload: any }>()
// );

// export const getLevelList = createAction(
//   AllFeatureActionTypes.GetLevelList
// );

// export const getLevelListSuccess = createAction(
//   AllFeatureActionTypes.GetLevelListSuccess,
//   props<{ level: Model.Options[] }>()
// );

// export const getLevelListFail = createAction(
//   AllFeatureActionTypes.GetLevelListFail,
//   props<{ payload: any }>()
// );

// export const getBasicApplicantList = createAction(
//   AllFeatureActionTypes.GetBasicApplicantList,
//   props<{ companyId: string }>()
// );

// export const getBasicApplicantListSuccess = createAction(
//   AllFeatureActionTypes.GetBasicApplicantListSuccess,
//   props<{ basicList: Model.BasicList[] }>()
// );

// export const getBasicApplicantListFail = createAction(
//   AllFeatureActionTypes.GetBasicApplicantListFail,
//   props<{ payload: any }>()
// );

// export const getExpiredApplicantList = createAction(
//   AllFeatureActionTypes.GetExpiredApplicantList,
//   props<{ companyId: string }>()
// );

// export const getExpiredApplicantListSuccess = createAction(
//   AllFeatureActionTypes.GetExpiredApplicantListSuccess,
//   props<{ expiredList: Model.BasicList[] }>()
// );

// export const getExpiredApplicantListFail = createAction(
//   AllFeatureActionTypes.GetExpiredApplicantListFail,
//   props<{ payload: any }>()
// );
