import { createAction, props } from "@ngrx/store";

import * as Model from '../auth.model';

enum AllAuthActionTypes {
  // login
  GetAuthCredentials = '[Auth] - Get Auth Credentials',
  GetAuthCredentialsSuccess = '[Auth] - Get Auth Credentials Success',
  GetAuthCredentialsFail = '[Auth] - Get Auth Credentials Fail',
  // signup
  CreateAuthCredentials = '[Auth] - Create Auth Credentials',
  CreateAuthCredentialsSuccess = '[Auth] - Create Auth Credentials Success',
  CreateAuthCredentialsFail = '[Auth] - Create Auth Credentials Fail',

  RefreshAuthCredentials = '[Auth] - Refresh Auth Credentials',
  RefreshAuthCredentialsSuccess = '[Auth] - Refresh Auth Credentials Success',
  RefreshAuthCredentialsFail = '[Auth] - Get Refresh Credentials Fail',

  GetUserProfile = '[Auth] - Get User Profile',
  GetUserProfileSuccess = '[Auth] - Get User Profile Success',
  GetUserProfileFail = '[Auth] - Get User Profile Fail',

  UpdateUserProfile = '[Auth] - Update User Profile',
  UpdateUserProfileSuccess = '[Auth] - Update User Profile Success',
  UpdateUserProfileFail = '[Auth] - Update User Profile Fail',

  ResetCredentials = '[Auth] - Reset Credentials'
};

export const resetCredentials = createAction(
  AllAuthActionTypes.ResetCredentials
);

export const getAuthCredentials = createAction(
  AllAuthActionTypes.GetAuthCredentials,
  props<{ loginCredentials: { email: string, password: string} }>()
);

export const getAuthCredentialsSuccess = createAction(
  AllAuthActionTypes.GetAuthCredentialsSuccess,
  props<{ credentials: Model.Credentials }>()
);

export const getAuthCredentialsFail = createAction(
  AllAuthActionTypes.GetAuthCredentialsFail,
  props<{ payload: any }>()
);

export const createAuthCredentials = createAction(
  AllAuthActionTypes.CreateAuthCredentials,
  props<{ credentials: Model.Credentials }>()
);

export const createAuthCredentialsSuccess = createAction(
  AllAuthActionTypes.CreateAuthCredentialsSuccess,
  props<{ credentials: Model.Credentials }>()
);

export const createAuthCredentialsFail = createAction(
  AllAuthActionTypes.CreateAuthCredentialsFail,
  props<{ payload: any }>()
);

export const refreshAuthCredentials = createAction(
  AllAuthActionTypes.RefreshAuthCredentials,
  props<{ email: string }>()
);

export const refreshAuthCredentialsSuccess = createAction(
  AllAuthActionTypes.RefreshAuthCredentialsSuccess,
  props<{ credentials: Model.Credentials }>()
);

export const refreshAuthCredentialsFail = createAction(
  AllAuthActionTypes.RefreshAuthCredentialsFail,
  props<{ payload: any }>()
);

export const getUserProfile = createAction(
  AllAuthActionTypes.GetUserProfile,
);

export const getUserProfileSuccess = createAction(
  AllAuthActionTypes.GetUserProfileSuccess,
  props<{ profile: Model.User }>()
);

export const getUserProfileFail = createAction(
  AllAuthActionTypes.GetUserProfileFail,
  props<{ payload: any }>()
);

export const updateUserProfile = createAction(
  AllAuthActionTypes.UpdateUserProfile,
  props<{ profile: Model.User }>()
);

export const updateUserProfileSuccess = createAction(
  AllAuthActionTypes.UpdateUserProfileSuccess,
  props<{ profile: Model.User }>()
);

export const updateUserProfileFail = createAction(
  AllAuthActionTypes.UpdateUserProfileFail,
  props<{ payload: any }>()
);
