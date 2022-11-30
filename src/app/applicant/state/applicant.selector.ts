import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ApplicantState } from './applicant.reducer';

const getApplicantInitState =
  createFeatureSelector<ApplicantState>('applicant');

export const loading = createSelector(
  getApplicantInitState,
  (state) => state.loading
);

export const getUser = createSelector(
  getApplicantInitState,
  (state) => state.user
);

export const getApplicantById = createSelector(
  getApplicantInitState,
  (state) => state.selected
);

export const getInitialDetails = createSelector(
  getApplicantInitState,
  (state) => state.initialDetails
);

export const getAdditionalInfo = createSelector(
  getApplicantInitState,
  (state) => state.additionalInfo
);

// export const applicantLoading = createSelector(
//   getApplicantInitState,
//   state => state.loading
// );

// export const getApplicantList = createSelector(
//   getApplicantInitState,
//   state => state.list
// );

export const success = createSelector(
  getApplicantInitState,
  state => state.succesMsg
);

// export const getApplicantDetails = createSelector(
//   getApplicantInitState,
//   state => state.selected
// );

// export const getIndustryList = createSelector(
//   getApplicantInitState,
//   state => state.industry
// );

// export const getBadgeList = createSelector(
//   getApplicantInitState,
//   state => state.badge
// );

// export const getApplicantRoleList = createSelector(
//   getApplicantInitState,
//   state => state.applicantRole
// );

export const getSetupList = createSelector(
  getApplicantInitState,
  state => state.setup
);

export const getTypeList = createSelector(
  getApplicantInitState,
  state => state.typeList
);

export const getLevelList = createSelector(
  getApplicantInitState,
  state => state.level
);

// export const getCategoryList = createSelector(
//   getApplicantInitState,
//   state => state.category
// );

// export const getIntialDetails = createSelector(
//   getApplicantInitState,
//   state => state.initialDetails
// );

// export const getApplicantInfo = createSelector(
//   getApplicantInitState,
//   state => state.applicantInfo
// );

export const getDocuments = createSelector(
  getApplicantInitState,
  state => state.documents
);

// export const getApplicantPreview = createSelector(
//   getApplicantInitState,
//   state => ({
//     industry: state.industry,
//     applicantRole: state.applicantRole,
//     setup: state.setup,
//     typeList: state.typeList,
//     level: state.level,
//     initialDetails: state.initialDetails,
//     applicantInfo: state.applicantInfo,
//     interview: state.interview
//   })
// );
