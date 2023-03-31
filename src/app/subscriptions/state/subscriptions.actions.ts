import {
  createAction,
  props
} from "@ngrx/store";
import * as Model from '../subscriptions.model';

enum AllSubscriptionsActionTypes {
  GetAllSubscriptions = '[subscriptions] - Get All Subscriptions',
  GetAllSubscriptionsSuccess = '[subscriptions] - Get All SubscriptionsSuccess',
  GetAllSubscriptionsFail = '[subscriptions] - Get All Subscriptions Fail',

  GetSubscriptions = '[subscriptions] - Get Subscriptions',
  GetSubscriptionsSuccess = '[subscriptions] - Get Subscriptions Success',
  GetSubscriptionsFail = '[subscriptions] - Get Subscriptions Fail',

}

// export const resetState = createAction(
//   AllSubscriptionsActionTypes.ResetState,
// );

export const getAllsubscriptions = createAction(
  AllSubscriptionsActionTypes.GetAllSubscriptions,
);

export const getAllsubscriptionsSuccess = createAction(
  AllSubscriptionsActionTypes.GetAllSubscriptionsSuccess,
  props<{ subscriptions: Model.Subscriptions[] }>()
);

export const getAllsubscriptionsFail = createAction(
  AllSubscriptionsActionTypes.GetAllSubscriptionsFail,
  props<{ payload: any }>()
);

export const getSubscriptions = createAction(
  AllSubscriptionsActionTypes.GetSubscriptions,
  props<{ subscriptionsId: string }>()
);

export const getSubscriptionsSuccess = createAction(
  AllSubscriptionsActionTypes.GetSubscriptionsSuccess,
  props<{ subscriptions: Model.Subscriptions }>()
);

export const getSubscriptionsFail = createAction(
  AllSubscriptionsActionTypes.GetSubscriptionsFail,
  props<{ payload: any }>()
);
