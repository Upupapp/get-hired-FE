import {
  createAction,
  props
} from "@ngrx/store";
import * as Model from '../application.model';

enum AllFeatureActionTypes {
  GetApplicationList = '[job] - Get Application List',
  GetApplicationListSuccess = '[job] - Get Application List Success',
  GetApplicationListFail = '[job] - Get Application List Fail',
};

export const getApplicationList = createAction(
  AllFeatureActionTypes.GetApplicationList,
  props<{ application: Model.Application }>()
);

export const getApplicationListSuccess = createAction(
  AllFeatureActionTypes.GetApplicationListSuccess,
  props<{ application: Model.Application[] }>()
);

export const getApplicationListFail = createAction(
  AllFeatureActionTypes.GetApplicationListFail,
  props<{ payload: any }>()
);
