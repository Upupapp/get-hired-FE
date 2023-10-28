import * as AppState from '@main/app.state';
import { createReducer, on } from '@ngrx/store';
import * as Model from '../interview.model';
import * as InterviewActions from './interview.actions';

export interface State extends AppState.State {
  interview: InterviewState;
}

export interface InterviewState {
  selected: Model.GroupInterview;
  list: Model.GroupInterview[];
  templateList: Model.InterviewQuestionTemplate[];
  recipientList: Model.InterviewRecipients;
  templateQuestions: Model.InterviewQuestion[];
  interviewQuestions: Model.InterviewQuestion;
  error: any;
  succesMsg: string;
  loading: boolean;
}

const initialState: InterviewState = {
  selected: null,
  list: [],
  templateList: [],
  recipientList: null,
  templateQuestions: [],
  interviewQuestions: null,
  error: null,
  succesMsg: null,
  loading: false,
}

export const interviewReducer = createReducer<InterviewState>(
  initialState,
  on(InterviewActions.getInterviewList, (state): InterviewState => {
    return {
      ...state,
      loading: true,
      error: null
    };
  }),
  on(InterviewActions.getInterviewListSuccess, (state, action): InterviewState => {
    return {
      ...state,
      loading: false,
      list: action.interviews
    };
  }),
  on(InterviewActions.getInterviewListFail, (state, action): InterviewState => {
    return {
      ...state,
      loading: false,
      error: action.payload
    };
  }),
  on(InterviewActions.getInterviewTemplatesList, (state): InterviewState => {
    return {
      ...state,
      loading: true,
      error: null
    };
  }),
  on(InterviewActions.getInterviewTemplatesListSuccess, (state, action): InterviewState => {
    return {
      ...state,
      loading: false,
      templateList: action.interviewTemplates
    };
  }),
  on(InterviewActions.getInterviewTemplatesListFail, (state, action): InterviewState => {
    return {
      ...state,
      loading: false,
      error: action.payload
    };
  }),
  on(InterviewActions.getInterviewRecipientList, (state): InterviewState => {
    return {
      ...state,
      loading: true,
      error: null
    };
  }),
  on(InterviewActions.getInterviewRecipientListSuccess, (state, action): InterviewState => {
    return {
      ...state,
      loading: false,
      recipientList: action.interviewRecipient
    };
  }),
  on(InterviewActions.getInterviewRecipientListFail, (state, action): InterviewState => {
    return {
      ...state,
      loading: false,
      error: action.payload
    };
  }),
  on(InterviewActions.getInterviewTemplateQuestions, (state): InterviewState => {
    return {
      ...state,
      loading: true,
      error: null
    };
  }),
  on(InterviewActions.getInterviewTemplateQuestionsSuccess, (state, action): InterviewState => {
    return {
      ...state,
      loading: false,
      templateQuestions: action.interviewTemplateQuestions
    };
  }),
  on(InterviewActions.getInterviewTemplateQuestionsFail, (state, action): InterviewState => {
    return {
      ...state,
      loading: false,
      error: action.payload
    };
  }),
  on(InterviewActions.saveGroupInterview, (state): InterviewState => {
    return {
      ...state,
      loading: true,
      error: null
    };
  }),
  on(InterviewActions.saveGroupInterviewSuccess, (state, action): InterviewState => {
    return {
      ...state,
      loading: false,
      selected: action.interview,
      succesMsg: 'created'
    };
  }),
  on(InterviewActions.saveGroupInterviewFail, (state, action): InterviewState => {
    return {
      ...state,
      loading: false,
      error: action.payload
    };
  }),
  on(InterviewActions.createQuestionTemplate, (state): InterviewState => {
    return {
      ...state,
      loading: true,
      error: null
    };
  }),
  on(InterviewActions.createQuestionTemplateSuccess, (state, action): InterviewState => {
    return {
      ...state,
      loading: false,
      succesMsg: 'created'
    };
  }),
  on(InterviewActions.createQuestionTemplateFail, (state, action): InterviewState => {
    return {
      ...state,
      loading: false,
      error: action.payload
    };
  }),
    on(InterviewActions.updateJobQuestion, (state): InterviewState => {
    return {
      ...state,
      loading: true
    };
  }),
  on(InterviewActions.updateJobQuestionSuccess, (state, action): InterviewState => {
    return {
      ...state,
      loading: false,
      interviewQuestions: action.interviewQuestion,
      error: null,
      succesMsg: 'updated'
    };
  }),

  on(InterviewActions.updateJobQuestionFail, (state, action): InterviewState => {
    return {
      ...state,
      loading: false,
      error: action.payload
    };
  }),
);
