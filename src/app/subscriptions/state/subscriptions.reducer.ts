import * as AppState from '@main/app.state';
import { createReducer, on } from '@ngrx/store';
import * as Model from '../subscriptions.model';
import * as SubscriptionsActions from './subscriptions.actions';

export interface State extends AppState.State {
  subscriptions: SubscriptionsState;
}

export interface SubscriptionsState {
  selected: Model.Subs;
  list: Model.Subs[];
  error: any;
  succesMsg: string;
  loading: boolean;
  companySubs: Model.CompanySubscriptions;
}

const initialState: SubscriptionsState = {
  selected: null,
  list: [],
  succesMsg: '',
  error: null,
  loading: false,
  companySubs: null
};

export const subscriptionsReducer = createReducer<SubscriptionsState>(
  initialState,
  on(SubscriptionsActions.getAllsubscriptions, (state): SubscriptionsState => {
    return {
      ...state,
      loading: true
    };
  }),
  on(SubscriptionsActions.getAllsubscriptionsSuccess, (state, action): SubscriptionsState => {
    return {
      ...state,
      loading: false,
      list: action.subscriptions,
      error: null
    };
  }),
  on(SubscriptionsActions.getAllsubscriptionsFail, (state, action): SubscriptionsState => {
    return {
      ...state,
      loading: false,
      error: action.payload
    };
  }),
  on(SubscriptionsActions.getCompanysubscriptions, (state): SubscriptionsState => {
    return {
      ...state,
      loading: true
    };
  }),
  on(SubscriptionsActions.getCompanysubscriptionsSuccess, (state, action): SubscriptionsState => {
    return {
      ...state,
      loading: false,
      companySubs: action.subscriptions,
      error: null
    };
  }),
  on(SubscriptionsActions.getCompanysubscriptionsFail, (state, action): SubscriptionsState => {
    return {
      ...state,
      loading: false,
      error: action.payload
    };
  }),
  on(SubscriptionsActions.getSubscriptions, (state): SubscriptionsState => {
    return {
      ...state,
      loading: true,
      error: null,
      succesMsg: null
    };
  }),
  on(SubscriptionsActions.getSubscriptionsSuccess, (state, action): SubscriptionsState => {
    return {
      ...state,
      loading: false,
      selected: action.subscriptions
    };
  }),
  on(SubscriptionsActions.getSubscriptionsFail, (state, action): SubscriptionsState => {
    return {
      ...state,
      loading: false,
      error: action.payload
    };
  })
);
