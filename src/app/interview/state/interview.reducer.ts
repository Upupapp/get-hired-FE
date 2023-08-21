import * as AppState from '@main/app.state';
import { createReducer, on } from '@ngrx/store';
import * as Model from '../interview.model';
import * as InterviewActions from './interview.actions';

export interface State extends AppState.State {
  interview: InterviewState;
}

export interface InterviewState {
  selected: null;
  list: Model.GroupInterview[];
  error: any;
  succesMsg: string;
  loading: boolean;
}

const initialState: InterviewState  = {
  selected: null,
  list: [],
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
);
