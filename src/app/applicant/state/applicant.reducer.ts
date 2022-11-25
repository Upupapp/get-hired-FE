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
  succesMsg: '';
  loading: boolean;
  initialDetails: Model.InitialDetails;

  // industry: Model.Options[];
  // badge: Model.Options[];
  // applicantRole: Model.Options[];
  // setup: Model.Options[];
  // typeList: Model.Options[];
  // level: Model.Options[];
  // category: Model.Options[];
  // initialDetails: Model.InitialDetails;
  // applicantInfo: Model.ApplicantInfo;
  // interview: InterviewModel.InterviewQuestion[],
  // applicant: Model.Applicant | null;
  // applicantLoading: boolean
}

const initialState: ApplicantState = {
  selected: null,
  list: [],
  error: null,
  succesMsg: null,
  loading: false,
  initialDetails: null
  // industry: [],
  // badge: [],
  // applicantRole: [],
  // setup: [],
  // typeList: [],
  // level: [],
  // category: [],
  // initialDetails: null,
  // applicantInfo: null,
  // interview: [],
  // applicant: null,
  // applicantLoading: false
};

export const applicantReducer = createReducer<ApplicantState>(
  initialState,
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
  on(ApplicantActions.setInitialDetails, (state, action): ApplicantState => {
    return {
      ...state,
      initialDetails: action.initialDetails
    };
  })
);
