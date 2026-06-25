import { createAction, props } from '@ngrx/store';
import * as Model from '../applicant.model';
import * as InterviewModel from '@main/interview/interview.model';

enum AllFeatureActionTypes {
  GetUserProfile = '[applicant] - Get User Profile status',
  GetUserProfileSuccess = '[applicant] - Get User Profile Success',
  GetUserProfileFail = '[applicant] - Get User Profile Fail',

  GetApplicant = '[applicant] - Get applicant status',
  GetApplicantSuccess = '[applicant] -Get applicant Success',
  GetApplicantFail = '[applicant] - Get applicant Fail',

  SaveBasicProfileInfo = '[applicant] - Save Basic Profile Info',
  SaveBasicProfileInfoSuccess = '[applicant] - Save Basic Profile Info Success',
  SaveBasicProfileInfoFail = '[applicant] - Save Basic Profile Info Fail',

  SaveProfessionalSkills = '[applicant] - Save Professional Skills',
  SaveProfessionalSkillSuccess = '[applicant] - Save Professional Skills Success',
  SaveProfessionalSkillsFail = '[applicant] - Save Professional Skills Fail',

  SaveWorkExperience = '[applicant] - Save Work Experience',
  SaveWorkExperienceSuccess = '[applicant] - Save Work Experience Success',
  SaveWorkExperienceFail = '[applicant] - Save Work Experience Fail',

  SaveEducationalBackground = '[applicant] - Save Educational Background',
  SaveEducationalBackgroundSuccess = '[applicant] - Save Educational Background Success',
  SaveEducationalBackgroundFail = '[applicant] - Save Educational Background Fail',

  SaveDocuments = '[applicant] - Save Documents',
  SaveDocumentsSuccess = '[applicant] - Save Documents Success',
  SaveDocumentsFail = '[applicant] - Save Documents Fail',

  SaveCertifications = '[applicant] - Save Certifications',
  SaveCertificationsSuccess = '[applicant] - Save Certifications Success',
  SaveCertificationsFail = '[applicant] - Save Certifications Fail',

  SaveVideoCV = '[applicant] - Save VideoCV',
  SaveVideoCVSuccess = '[applicant] - Save VideoCV Success',
  SaveVideoCVFail = '[applicant] - Save VideoCV Fail',

  // **************************

  SetInitialDetails = '[applicant] - Set Initial Details',
  SetAdditionalInfo = '[applicant] - Set Additional Info',
  SetProfileDocuments = '[applicant] - Set Profile Documents',

  SaveApplicant = '[applicant] - Save Applicant status',
  SaveApplicantSuccess = '[applicant] -Save Applicant Success',
  SaveApplicantFail = '[applicant] - Save Applicant Fail',

  GetApplicantDashboard = '[applicant] - Get applicant status Dashboard',
  GetApplicantDashboardSuccess = '[applicant] -Get applicant Success Dashboard',
  GetApplicantDashboardFail = '[applicant] - Get applicant Fail Dashboard',

  GetSetupList = '[applicant] - Get Setup List',
  GetSetupListSuccess = '[applicant] - Get Setup List Success',
  GetSetupListFail = '[applicant] - Get Setup List Fail',

  GetTypeList = '[applicant] - Get Type List',
  GetTypeListSuccess = '[applicant] - Get Type List Success',
  GetTypeListFail = '[applicant] - Get Type List Fail',

  GetLevelList = '[applicant] - Get Level List',
  GetLevelListSuccess = '[applicant] - Get Level List Success',
  GetLevelListFail = '[applicant] - Get Level List Fail',
}

export const saveVideoCV = createAction(
  AllFeatureActionTypes.SaveVideoCV,
  props<{ video: Model.VideoCV, profileId: string }>()
);

export const saveVideoCVSuccess = createAction(
  AllFeatureActionTypes.SaveVideoCVSuccess,
  props<{ video: Model.VideoCV }>()
);

export const saveVideoCVFail = createAction(
  AllFeatureActionTypes.SaveVideoCVFail,
  props<{ payload: any }>()
);

export const saveCertifications = createAction(
  AllFeatureActionTypes.SaveCertifications,
  props<{ certs: Model.Certifications[], profileId: string }>()
);

export const saveCertificationsSuccess = createAction(
  AllFeatureActionTypes.SaveCertificationsSuccess,
  props<{ certs: Model.Certifications[] }>()
);

export const saveCertificationsFail = createAction(
  AllFeatureActionTypes.SaveCertificationsFail,
  props<{ payload: any }>()
);

export const saveDocuments = createAction(
  AllFeatureActionTypes.SaveDocuments,
  props<{ docs: Model.Documents[], profileId: string }>()
);

export const saveDocumentsSuccess = createAction(
  AllFeatureActionTypes.SaveDocumentsSuccess,
  props<{ docs: Model.Documents[] }>()
);

export const saveDocumentsFail = createAction(
  AllFeatureActionTypes.SaveDocumentsFail,
  props<{ payload: any }>()
);

export const saveProfessionalSkills = createAction(
  AllFeatureActionTypes.SaveProfessionalSkills,
  props<{ skills: string[], profileId: string }>()
);

export const saveProfessionalSkillsSuccess = createAction(
  AllFeatureActionTypes.SaveProfessionalSkillSuccess,
  props<{ skills: string[] }>()
);

export const saveProfessionalSkillsFail = createAction(
  AllFeatureActionTypes.SaveProfessionalSkillsFail,
  props<{ payload: any }>()
);

export const saveApplicantBasicProfile = createAction(
  AllFeatureActionTypes.SaveBasicProfileInfo,
  props<{ basicProfile: Model.BasicProfileInfo }>()
);

export const saveApplicantBasicProfileSuccess = createAction(
  AllFeatureActionTypes.SaveBasicProfileInfoSuccess,
  props<{ basicProfile: Model.BasicProfileInfo }>()
);

export const saveApplicantBasicProfileFail = createAction(
  AllFeatureActionTypes.SaveBasicProfileInfoFail,
  props<{ payload: any }>()
);

export const saveWorkExperience = createAction(
  AllFeatureActionTypes.SaveWorkExperience,
  props<{ workExperience: Model.WorkExperience[], profileId: string }>()
);

export const saveWorkExperienceSuccess = createAction(
  AllFeatureActionTypes.SaveWorkExperienceSuccess,
  props<{ workExperience: Model.WorkExperience[] }>()
);

export const saveWorkExperienceFail = createAction(
  AllFeatureActionTypes.SaveWorkExperienceFail,
  props<{ payload: any }>()
);

export const saveEducationalBackground = createAction(
  AllFeatureActionTypes.SaveEducationalBackground,
  props<{ educBg: Model.EducationalBackground[], profileId: string }>()
);

export const saveEducationalBackgroundSuccess = createAction(
  AllFeatureActionTypes.SaveEducationalBackgroundSuccess,
  props<{ educBg: Model.EducationalBackground[] }>()
);

export const saveEducationalBackgroundFail = createAction(
  AllFeatureActionTypes.SaveEducationalBackgroundFail,
  props<{ payload: any }>()
);

export const applicantDashboard = createAction(
  AllFeatureActionTypes.GetApplicantDashboard
);

export const applicantDashboardSuccess = createAction(
  AllFeatureActionTypes.GetApplicantDashboard,
  props<{ dashboard: Model.Dashboard }>()
);

export const applicantDashboardFail = createAction(
  AllFeatureActionTypes.GetApplicantDashboard,
  props<{ payload: any }>()
);

// SEC-01 FIX: no userId prop — identity is resolved server-side from the JWT.
// Callers dispatch this with no payload; the backend never receives a uid.
export const getUserProfile = createAction(
  AllFeatureActionTypes.GetUserProfile
);

export const getUserProfileSuccess = createAction(
  AllFeatureActionTypes.GetUserProfileSuccess,
  props<{ user: Model.User }>()
);

export const getUserProfileFail = createAction(
  AllFeatureActionTypes.GetUserProfileFail,
  props<{ payload: any }>()
);

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
  AllFeatureActionTypes.SetInitialDetails,
  props<{ initialDetails: Model.InitialDetails }>()
);

export const setAdditionalInfo = createAction(
  AllFeatureActionTypes.SetAdditionalInfo,
  props<{ additionalInfo: Model.AdditionalInfo }>()
);

export const setProfileDocuments = createAction(
  AllFeatureActionTypes.SetProfileDocuments,
  props<{ profileDocs: Model.ProfileDocuments }>()
);

export const saveApplicant = createAction(
  AllFeatureActionTypes.SaveApplicant,
  props<{ applicant: Model.Applicant }>()
);

export const saveApplicantSuccess = createAction(
  AllFeatureActionTypes.SaveApplicantSuccess,
  props<{ applicant: Model.Applicant }>()
);

export const saveApplicantFail = createAction(
  AllFeatureActionTypes.SaveApplicantFail,
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
