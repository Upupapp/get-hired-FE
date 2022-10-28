import { createAction, props } from "@ngrx/store";

import * as Model from '../app.model';

enum AllAppActionTypes {
  ResetAuthCredentials = '[App] - Reset Auth Credentials',
  RefreshAuthCredentials = '[App] - Refresh Auth Credentials',
  RefreshAuthCredentialsSuccess = '[App] - Refresh Auth Credentials Success',
  RefreshAuthCredentialsFail = '[App] - Get Refresh Credentials Fail',
};

export const resetAuthCredentials = createAction(
  AllAppActionTypes.ResetAuthCredentials
);

export const refreshAuthCredentials = createAction(
  AllAppActionTypes.RefreshAuthCredentials,
  props<{ email: string }>()
);

export const refreshAuthCredentialsSuccess = createAction(
  AllAppActionTypes.RefreshAuthCredentialsSuccess,
  props<{ credentials: Model.Credentials }>()
);

export const refreshAuthCredentialsFail = createAction(
  AllAppActionTypes.RefreshAuthCredentialsFail,
  props<{ payload: any }>()
);
