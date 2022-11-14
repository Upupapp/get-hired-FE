import {
  createAction,
  props
} from "@ngrx/store";
import * as Model from '../job.model';

enum AllFeatureActionTypes {
  GetIndustryList = '[job] - Get Industry List',
  GetIndustryListSuccess = '[job] - Get Industry List Success',
  GetIndustryListFail = '[job] - Get Industry List Fail',

  GetCategoryList = '[job] - Get Category List',
  GetCategoryListSuccess = '[job] - Get Category List Success',
  GetCategoryListFail = '[job] - Get Category List Fail',

  GetBadgeList = '[job] - Get Badge List',
  GetBadgeListSuccess = '[job] - Get Badge List Success',
  GetBadgeListFail = '[job] - Get Badge List Fail',

  GetJobRoleList = '[job] - Get Job Role List',
  GetJobRoleListSuccess = '[job] - Get Job Role List Success',
  GetJobRoleListFail = '[job] - Get Job Role List Fail',

  GetSetupList = '[job] - Get Setup List',
  GetSetupListSuccess = '[job] - Get Setup List Success',
  GetSetupListFail = '[job] - Get Setup List Fail',

  GetTypeList = '[job] - Get Type List',
  GetTypeListSuccess = '[job] - Get Type List Success',
  GetTypeListFail = '[job] - Get Type List Fail',

  GetLevelList = '[job] - Get Level List',
  GetLevelListSuccess = '[job] - Get Level List Success',
  GetLevelListFail = '[job] - Get Level List Fail',

  SetJobInitialDetails = '[job] - Set Job Initial Details'
};

export const setJobInitialDetails = createAction(
  AllFeatureActionTypes.SetJobInitialDetails,
  props<{ initialDetails: Model.InitialDetails }>()
);

export const getCategoryList = createAction(
  AllFeatureActionTypes.GetCategoryList
);

export const getCategoryListSuccess = createAction(
  AllFeatureActionTypes.GetCategoryListSuccess,
  props<{ category: Model.Options[] }>()
);

export const getCategoryListFail = createAction(
  AllFeatureActionTypes.GetCategoryListFail,
  props<{ payload: any }>()
);

export const getIndustryList = createAction(
  AllFeatureActionTypes.GetIndustryList
);

export const getIndustryListSuccess = createAction(
  AllFeatureActionTypes.GetIndustryListSuccess,
  props<{ industry: Model.Options[] }>()
);

export const getIndustryListFail = createAction(
  AllFeatureActionTypes.GetIndustryListFail,
  props<{ payload: any }>()
);

export const getBadgeList = createAction(
  AllFeatureActionTypes.GetBadgeList
);

export const getBadgeListSuccess = createAction(
  AllFeatureActionTypes.GetBadgeListSuccess,
  props<{ badge: Model.Options[] }>()
);

export const getBadgeListFail = createAction(
  AllFeatureActionTypes.GetBadgeListFail,
  props<{ payload: any }>()
);

export const getJobRoleList = createAction(
  AllFeatureActionTypes.GetJobRoleList
);

export const getJobRoleListSuccess = createAction(
  AllFeatureActionTypes.GetJobRoleListSuccess,
  props<{ jobRole: Model.Options[] }>()
);

export const getJobRoleListFail = createAction(
  AllFeatureActionTypes.GetJobRoleListFail,
  props<{ payload: any }>()
);

export const getSetupList = createAction(
  AllFeatureActionTypes.GetSetupList
);

export const getSetupListSuccess = createAction(
  AllFeatureActionTypes.GetSetupListSuccess,
  props<{ setup: Model.Options[] }>()
);

export const getSetupListFail = createAction(
  AllFeatureActionTypes.GetSetupListFail,
  props<{ payload: any }>()
);

export const getTypeList = createAction(
  AllFeatureActionTypes.GetTypeList
);

export const getTypeListSuccess = createAction(
  AllFeatureActionTypes.GetTypeListSuccess,
  props<{ typeList: Model.Options[] }>()
);

export const getTypeListFail = createAction(
  AllFeatureActionTypes.GetTypeListFail,
  props<{ payload: any }>()
);

export const getLevelList = createAction(
  AllFeatureActionTypes.GetLevelList
);

export const getLevelListSuccess = createAction(
  AllFeatureActionTypes.GetLevelListSuccess,
  props<{ level: Model.Options[] }>()
);

export const getLevelListFail = createAction(
  AllFeatureActionTypes.GetLevelListFail,
  props<{ payload: any }>()
);
