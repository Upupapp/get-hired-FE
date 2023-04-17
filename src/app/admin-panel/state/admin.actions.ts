import { createAction, props } from '@ngrx/store';
import * as Model from '../admin.model';

enum AllFeatureActionTypes {
  GetUserProfile = '[admin] - Get User Profile status',
  GetUserProfileSuccess = '[admin] -Get User Profile Success',
  GetUserProfileFail = '[admin] - Get User Profile Fail',

  GetAdmin = '[admin] - Get admin status',
  GetAdminSuccess = '[admin] -Get admin Success',
  GetAdminFail = '[admin] - Get admin Fail',

  GetAdminDashboard = '[admin] - Get admin status Dashboard',
  GetAdminDashboardSuccess = '[admin] -Get admin Success Dashboard',
  GetAdminDashboardFail = '[admin] - Get admin Fail Dashboard',
}


export const adminDashboard = createAction(
  AllFeatureActionTypes.GetAdminDashboard
);

export const adminDashboardSuccess = createAction(
  AllFeatureActionTypes.GetAdminDashboard,
  props<{ dashboard: Model.Dashboard }>()
);

export const adminDashboardFail = createAction(
  AllFeatureActionTypes.GetAdminDashboard,
  props<{ payload: any }>()
);

export const getUserProfile = createAction(
  AllFeatureActionTypes.GetUserProfile,
  props<{ userId: string }>()
);

export const getUserProfileSuccess = createAction(
  AllFeatureActionTypes.GetUserProfileSuccess,
  props<{ user: Model.User }>()
);

export const getUserProfileFail = createAction(
  AllFeatureActionTypes.GetUserProfileFail,
  props<{ payload: any }>()
);

export const getAdmin = createAction(
  AllFeatureActionTypes.GetAdmin,
  props<{ adminId: any }>()
);

export const getAdminSuccess = createAction(
  AllFeatureActionTypes.GetAdminSuccess,
  props<{ admin: Model.Admin }>()
);

export const getAdminFail = createAction(
  AllFeatureActionTypes.GetAdminFail,
  props<{ payload: any }>()
);


