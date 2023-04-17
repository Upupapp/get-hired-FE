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

  GetCompanySubscriptions = '[subscriptions] - Get Company Subscriptions',
  GetCompanySubscriptionsSuccess = '[subscriptions] - Get Company SubscriptionsSuccess',
  GetCompanySubscriptionsFail = '[subscriptions] - Get Company Subscriptions Fail',
}

// export const resetState = createAction(
//   AllSubscriptionsActionTypes.ResetState,
// );

export const getAllsubscriptions = createAction(
  AllSubscriptionsActionTypes.GetAllSubscriptions,
);

export const getAllsubscriptionsSuccess = createAction(
  AllSubscriptionsActionTypes.GetAllSubscriptionsSuccess,
  props<{ subscriptions: Model.Subs[] }>()
);

export const getAllsubscriptionsFail = createAction(
  AllSubscriptionsActionTypes.GetAllSubscriptionsFail,
  props<{ payload: any }>()
);

export const getCompanysubscriptions = createAction(
  AllSubscriptionsActionTypes.GetCompanySubscriptions,
  props<{ companyId: string }>()
);

export const getCompanysubscriptionsSuccess = createAction(
  AllSubscriptionsActionTypes.GetCompanySubscriptionsSuccess,
  props<{ subscriptions: Model.CompanySubscriptions[] }>()
);

export const getCompanysubscriptionsFail = createAction(
  AllSubscriptionsActionTypes.GetCompanySubscriptionsFail,
  props<{ payload: any }>()
);

export const getSubscriptions = createAction(
  AllSubscriptionsActionTypes.GetSubscriptions,
  props<{ subscriptionsId: string }>()
);

export const getSubscriptionsSuccess = createAction(
  AllSubscriptionsActionTypes.GetSubscriptionsSuccess,
  props<{ subscriptions: Model.Subs }>()
);

export const getSubscriptionsFail = createAction(
  AllSubscriptionsActionTypes.GetSubscriptionsFail,
  props<{ payload: any }>()
);
