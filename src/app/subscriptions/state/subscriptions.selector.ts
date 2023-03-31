import { createFeatureSelector, createSelector } from "@ngrx/store";
import { SubscriptionsState } from './subscriptions.reducer';

const getSubscriptionsInitState = createFeatureSelector<SubscriptionsState >('subscriptions');

export const loading = createSelector (
  getSubscriptionsInitState,
  state => state.loading
);

export const getSuccessMsg = createSelector (
  getSubscriptionsInitState,
  state => state.succesMsg
);

export const getSubscriptionsList = createSelector (
  getSubscriptionsInitState,
  state => state.list
);

export const getSubscriptionsDetails = createSelector (
  getSubscriptionsInitState,
  state => state.selected
);
