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
      // REAL-TIME PROFILE UPDATES: state.selected is the single shared
      // "full profile" object every read-only display surface (Avatar,
      // Details' Video Introduction section, etc. -- anything subscribed
      // to applicantDetails$/getApplicantById) actually renders from. This
      // save's response only ever updated the separate videoCV field
      // above, leaving state.selected.videoCVUrl stale until whatever page
      // the user next lands on happened to re-dispatch getApplicantById()
      // itself -- edits didn't show up "live" across already-mounted
      // sections in the same session. Same fix applied to every other
      // save-success case below.
      selected: state.selected ? { ...state.selected, videoCVUrl: action.video.videoCVUrl } : state.selected,
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
      // See saveVideoCVSuccess's doc comment above for why this is needed.
      selected: state.selected ? { ...state.selected, documents: action.docs } : state.selected,
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
      // See saveVideoCVSuccess's doc comment above for why this is needed.
      selected: state.selected ? { ...state.selected, certifications: action.certs } : state.selected,
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
      // See saveVideoCVSuccess's doc comment above for why this is needed.
      selected: state.selected ? { ...state.selected, educationalBackground: action.educBg } : state.selected,
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
      // See saveVideoCVSuccess's doc comment above for why this is needed.
      selected: state.selected ? { ...state.selected, workExperience: action.workExperience } : state.selected,
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
      // See saveVideoCVSuccess's doc comment above for why this is needed.
      // getApplicantSuccess (below) maps action.applicant.skills into
      // additionalInfo.professionalSkills -- "skills" is the field name on
      // the raw Applicant/state.selected object itself.
      selected: state.selected ? { ...state.selected, skills: action.skills } : state.selected,
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
      // BUGFIX: the topbar avatar (applicant-panel.component.html's
      // gh-ap-topbar-avatar) reads user$/state.user, which was only ever
      // populated once by getUserProfileSuccess (typically on initial
      // panel load) and never touched by this action -- a successful
      // avatar/basic-info save updated basicProfile but left state.user's
      // photoUrl stale, so the topbar kept showing the old photo until a
      // full page reload re-fetched the user. Merge the new photoUrl into
      // state.user too so the topbar updates immediately.
      user: state.user
        ? { ...state.user, photoUrl: action.basicProfile.photoUrl }
        : state.user,
      // REAL-TIME PROFILE UPDATES (see saveVideoCVSuccess's doc comment
      // above for the general explanation). Listed explicitly rather than
      // a blanket `...action.basicProfile` spread: basicProfile comes from
      // updateProfileBasicInfo()'s narrower UPDATE query, which never
      // joins job_type/job_level/work_setup -- it always includes
      // jobTypeName/jobLevelName/workSetupName as keys, just undefined.
      // A blanket spread would overwrite state.selected's real (joined,
      // human-readable) label values with those undefineds after every
      // Basic Info save.
      // BasicProfileInfo types its numeric-ID fields (jobTypeId, jobLevelId,
      // workSetupId) as `string`, while Applicant types the same underlying
      // ids as `number` -- a pre-existing looseness between these two
      // models, not something introduced here. Cast at the object-literal
      // boundary rather than per-field; runtime values are unaffected
      // either way (both sides ultimately hold whatever the backend sent).
      // CRITICAL BUGFIX: previously `state.selected ? {...merge} : state.selected`
      // -- for a genuinely brand-new applicant (first-ever Basic Info save,
      // no prior profile row to have fetched), state.selected starts out
      // null, so that guard skipped the merge entirely and left it null.
      // profile-forms.component.ts's applicantProfileId (its OWN gate for
      // rendering Step 2/3's content -- `*ngIf="stepper === 2 &&
      // applicantProfileId"` -- AND for showing the "Profile Preview"/
      // "Finish & View Profile" button that's the only way to trigger
      // redirectToProfile()'s return-to-job redirect) comes exclusively
      // from this same state.selected via applicantDetails$. With it stuck
      // null, a new applicant who just created their profile hit a
      // literal dead end: Step 2 rendered nothing, and there was no button
      // left to get back to the job they were trying to apply for.
      // Now always builds a real object -- spread onto state.selected when
      // it exists (preserves any already-known joined fields), or onto {}
      // for the true first-save case (nothing existed to preserve anyway).
      selected: {
        ...(state.selected || {}),
        photoUrl: action.basicProfile.photoUrl,
        jobTitle: action.basicProfile.jobTitle,
        shortBio: action.basicProfile.shortBio,
        servicesProvided: action.basicProfile.servicesProvided,
        jobTypeId: action.basicProfile.jobTypeId,
        jobLevelId: action.basicProfile.jobLevelId,
        workSetUpId: action.basicProfile.workSetupId,
        salaryMinimum: action.basicProfile.salaryMinimum,
        salaryMaximum: action.basicProfile.salaryMaximum,
        salaryCurrency: action.basicProfile.salaryCurrency,
        firstName: action.basicProfile.firstName,
        lastName: action.basicProfile.lastName,
        address: action.basicProfile.address,
        city: action.basicProfile.city,
        country: action.basicProfile.country,
        contactNumber: action.basicProfile.contactNumber,
        applicantProfileId: action.basicProfile.applicantProfileId,
      } as unknown as Model.Applicant,
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
