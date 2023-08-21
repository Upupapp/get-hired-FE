import { createFeatureSelector, createSelector } from "@ngrx/store";
import { InterviewState } from './interview.reducer';

const getInterviewInitState = createFeatureSelector<InterviewState>('interview');

export const loading = createSelector(
  getInterviewInitState,
  state => state.loading
);

export const getInterviewList = createSelector(
  getInterviewInitState,
  state => state.list
);

export const success = createSelector(
  getInterviewInitState,
  state => state.succesMsg
);

export const getInterviewDetails = createSelector(
  getInterviewInitState,
  state => state.selected
);
