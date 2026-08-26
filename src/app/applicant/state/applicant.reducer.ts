import * as AppState from '@main/app.state';
import { createReducer, on } from '@ngrx/store';
import * as Model from '../applicant.model';
import * as ApplicantActions from './applicant.actions';
import * as InterviewModel from '@main/interview/interview.model';

export interface State extends AppState.State {
  applicant: ApplicantState;
}

export interface ApplicantState {
  selected: Model.Applicant;
  list: Model.Applicant[];
  error: any;
  succesMsg: string;
  loading: boolean;
  basicProfile: Model.BasicProfileInfo;
  additionalInfo: Model.AdditionalInfo;
  documents: Model.Documents[];
  videoCV: Model.VideoCV;

  initialDetails: Model.InitialDetails;
  user: Model.User;
  // industry: Model.Options[];
  // badge: Model.Options[];
  // applicantRole: Model.Options[];
  setup: Model.Options[];
  typeList: Model.Options[];
  level: Model.Options[];
  // category: Model.Options[];
  profileDocs: Model.ProfileDocuments;
  dashboard
  // applicant: Model.Applicant | null;
  // applicantLoading: boolean
}

const initialState: ApplicantState = {
  selected: null,
  list: [],
  error: null,
  succesMsg: null,
  loading: false,
  basicProfile: null,
  initialDetails: null,
  additionalInfo: null,
  user: null,
  // industry: [],
  // badge: [],
  // applicantRole: [],
  setup: [],
  typeList: [],
  level: [],
  dashboard: [],
  // category: [],
  // initialDetails: null,
  // applicantInfo: null,
  documents: [],
  videoCV: null,
  profileDocs: null
  // applicantLoading: false
};

export const applicantReducer = createReducer<ApplicantState>(
  initialState,
  on(ApplicantActions.saveVideoCV, (state): ApplicantState => {
    return {
      ...state,
      loading: true,
      succesMsg: null,
    };
  }),
  on(ApplicantActions.saveVideoCVSuccess, (state, action): ApplicantState => {
    return {
      ...state,
      loading: false,
      videoCV: action.video,
      succesMsg: action.video.videoCVUrl ? 'updated': 'deleted'
    };
  }),
  on(ApplicantActions.saveVideoCVFail, (state, action): ApplicantState => {
    return {
      ...state,
      loading: false,
      error: action.payload,
      succesMsg: null,
    };
  }),
  on(ApplicantActions.saveDocuments, (state): ApplicantState => {
    return {
      ...state,
      loading: true,
      succesMsg: null,
    };
  }),
  on(ApplicantActions.saveDocumentsSuccess, (state, action): ApplicantState => {
    return {
      ...state,
      loading: false,
      documents: action.docs,
      succesMsg: 'updated'
    };
  }),
  on(ApplicantActions.saveDocumentsFail, (state, action): ApplicantState => {
    return {
      ...state,
      error: action.payload,
      succesMsg: null,
    };
  }),
  on(ApplicantActions.saveCertifications, (state): ApplicantState => {
    return {
      ...state,
      loading: true,
      succesMsg: null,
    };
  }),
  on(ApplicantActions.saveCertificationsSuccess, (state, action): ApplicantState => {
    return {
      ...state,
      loading: false,
      additionalInfo: {
        ...state.additionalInfo,
        certifications: action.certs
      },
      succesMsg: 'updated'
    };
  }),
  on(ApplicantActions.saveCertificationsFail, (state, action): ApplicantState => {
    return {
      ...state,
      error: action.payload,
      succesMsg: null,
    };
  }),
  on(ApplicantActions.saveEducationalBackground, (state): ApplicantState => {
    return {
      ...state,
      loading: true,
      succesMsg: null,
    };
  }),
  on(ApplicantActions.saveEducationalBackgroundSuccess, (state, action): ApplicantState => {
    return {
      ...state,
      loading: false,
      additionalInfo: {
        ...state.additionalInfo,
        educationalBackground: action.educBg
      },
      succesMsg: 'updated'
    };
  }),
  on(ApplicantActions.saveEducationalBackgroundFail, (state, action): ApplicantState => {
    return {
      ...state,
      error: action.payload,
      succesMsg: null,
    };
  }),
  on(ApplicantActions.saveWorkExperience, (state): ApplicantState => {
    return {
      ...state,
      loading: true,
      succesMsg: null,
    };
  }),
  on(ApplicantActions.saveWorkExperienceSuccess, (state, action): ApplicantState => {
    return {
      ...state,
      loading: false,
      additionalInfo: {
        ...state.additionalInfo,
        workExperience: action.workExperience
      },
      succesMsg: 'updated'
    };
  }),
  on(ApplicantActions.saveWorkExperienceFail, (state, action): ApplicantState => {
    return {
      ...state,
      error: action.payload,
      succesMsg: null,
    };
  }),
  on(ApplicantActions.saveProfessionalSkills, (state): ApplicantState => {
    return {
      ...state,
      loading: true,
      succesMsg: null,
    };
  }),
  on(ApplicantActions.saveProfessionalSkillsSuccess, (state, action): ApplicantState => {
    return {
      ...state,
      loading: false,
      additionalInfo: {
        ...state.additionalInfo,
        professionalSkills: action.skills
      },
      succesMsg: 'updated'
    };
  }),
  on(ApplicantActions.saveProfessionalSkillsFail, (state, action): ApplicantState => {
    // BUGFIX: this case never reset loading back to false (unlike its own
    // Success sibling right above it), so a failed save left `loading`
    // stuck true forever -- the loading dialog (which only closes when
    // loading transitions to false) never closed, which is exactly what
    // reads as "the loading is so long": on any failure it wasn't slow,
    // it was permanently stuck.
    return {
      ...state,
      loading: false,
      error: action.payload,
      succesMsg: null,
    };
  }),
  on(ApplicantActions.saveApplicantBasicProfile, (state): ApplicantState => {
    return {
      ...state,
      loading: true,
      succesMsg: null,
    };
  }),
  on(ApplicantActions.saveApplicantBasicProfileSuccess, (state, action): ApplicantState => {
    return {
      ...state,
      loading: false,
      basicProfile: action.basicProfile,
      succesMsg: action.basicProfile.applicantProfileId ? 'updated' : 'created'
    };
  }),
  on(ApplicantActions.saveApplicantBasicProfileFail, (state, action): ApplicantState => {
    return {
      ...state,
      error: action.payload,
      succesMsg: null,
    };
  }),
  on(ApplicantActions.getUserProfile, (state): ApplicantState => {
    return {
      ...state,
      loading: true,
      succesMsg: null,
    };
  }),
  on(ApplicantActions.getUserProfileSuccess, (state, action): ApplicantState => {
    return {
      ...state,
      user: action.user,
      loading: false,
    };
  }),
  on(ApplicantActions.getUserProfileFail, (state, action): ApplicantState => {
    return {
      ...state,
      loading: false,
      error: action.payload,
      succesMsg: null,
    };
  }),
  on(ApplicantActions.getApplicant, (state): ApplicantState => {
    return {
      ...state,
      loading: true,
      succesMsg: null,
    };
  }),
  on(ApplicantActions.getApplicantSuccess, (state, action): ApplicantState => {
    return {
      ...state,
      selected: action.applicant,
      additionalInfo: {
        certifications: action.applicant ? action.applicant.certifications: null,
        educationalBackground: action.applicant ? action.applicant.educationalBackground: null,
        workExperience: action.applicant ? action.applicant.workExperience: null,
        professionalSkills: action.applicant ? action.applicant.skills: null
      },
      documents: action.applicant ? action.applicant.documents: null,
      videoCV: {
        ...state.videoCV,
        videoCVUrl: action.applicant ? action.applicant.videoCVUrl: null
      },
      loading: false,
    };
  }),
  on(ApplicantActions.getApplicantFail, (state, action): ApplicantState => {
    return {
      ...state,
      loading: false,
      error: action.payload,
      succesMsg: null,
    };
  }),
  on(ApplicantActions.saveApplicant, (state): ApplicantState => {
    return {
      ...state,
      loading: true,
      succesMsg: null,
    };
  }),
  on(ApplicantActions.saveApplicantSuccess, (state, action): ApplicantState => {
    return {
      ...state,
      selected: action.applicant,
      loading: false,
      succesMsg: action.applicant.applicantProfileId ? 'updated' : 'created'
    };
  }),
  on(ApplicantActions.saveApplicantFail, (state, action): ApplicantState => {
    return {
      ...state,
      loading: false,
      error: action.payload,
      succesMsg: null,
    };
  }),
  on(ApplicantActions.setInitialDetails, (state, action): ApplicantState => {
    return {
      ...state,
      initialDetails: action.initialDetails,
      succesMsg: 'saveStepperForm'
    };
  }),
  on(ApplicantActions.setAdditionalInfo, (state, action): ApplicantState => {
    return {
      ...state,
      additionalInfo: action.additionalInfo,
      selected: {
        ...state.selected,
        workExperience: action.additionalInfo.workExperience,
        educationalBackground: action.additionalInfo.educationalBackground,
        certifications: action.additionalInfo.certifications,
        skills: action.additionalInfo.professionalSkills,
      },
      succesMsg: 'saveStepperForm'
    };
  }),
  on(ApplicantActions.setProfileDocuments, (state, action): ApplicantState => {
    return {
      ...state,
      profileDocs: action.profileDocs,
      succesMsg: 'saveStepperForm'
    };
  }),
  on(ApplicantActions.getSetupList, (state): ApplicantState => {
    return {
      ...state,
      loading: true
    };
  }),
  on(ApplicantActions.getSetupListSuccess, (state, action): ApplicantState => {
    return {
      ...state,
      loading: false,
      setup: action.setup,
      error: null,
    };
  }),
  on(ApplicantActions.getSetupListFail, (state, action): ApplicantState => {
    return {
      ...state,
      loading: false,
      error: action.payload
    };
  }),
  on(ApplicantActions.getTypeList, (state): ApplicantState => {
    return {
      ...state,
      loading: true
    };
  }),
  on(ApplicantActions.getTypeListSuccess, (state, action): ApplicantState => {
    return {
      ...state,
      loading: false,
      typeList: action.typeList,
      error: null,
    };
  }),
  on(ApplicantActions.getTypeListFail, (state, action): ApplicantState => {
    return {
      ...state,
      loading: false,
      error: action.payload
    };
  }),
  on(ApplicantActions.getLevelList, (state): ApplicantState => {
    return {
      ...state,
      loading: true
    };
  }),
  on(ApplicantActions.getLevelListSuccess, (state, action): ApplicantState => {
    return {
      ...state,
      loading: false,
      level: action.level,
      error: null,
    };
  }),
  on(ApplicantActions.getLevelListFail, (state, action): ApplicantState => {
    return {
      ...state,
      loading: false,
      error: action.payload
    };
  }),
  on(ApplicantActions.applicantDashboard, (state): ApplicantState => {
    return {
      ...state,
      loading: true,
      error: null,
      succesMsg: null
    };
  }),
  on(ApplicantActions.applicantDashboardSuccess, (state, action): ApplicantState => {
    return {
      ...state,
      loading: false,
      dashboard: action.dashboard
    };
  }),
  on(ApplicantActions.applicantDashboardFail, (state, action): ApplicantState => {
    return {
      ...state,
      loading: false,
      error: action.payload
    };
  }),
);
