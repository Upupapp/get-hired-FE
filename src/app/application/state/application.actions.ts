import {
  createAction,
  props
} from "@ngrx/store";
import * as Model from '../application.model';

enum AllFeatureActionTypes {
  SubmitApplication = '[application] - Submit Application',
  SubmitApplicationSuccess = '[application] - Submit Application Submit',
  SubmitApplicationFail = '[application] - Submit Application Fail',

  // GetApplicationList = '[application] - Get Application List',
  // GetApplicationListSuccess = '[application] - Get Application List Success',
  // GetApplicationListFail = '[application] - Get Application List Fail',
};

export const submitApplication = createAction(
  AllFeatureActionTypes.SubmitApplication,
  props<{ application: Model.Application }>()
);

export const submitApplicationSuccess = createAction(
  AllFeatureActionTypes.SubmitApplicationSuccess,
  props<{ application: Model.Application }>()
);

export const submitApplicationFail = createAction(
  AllFeatureActionTypes.SubmitApplicationFail,
  props<{ payload: any }>()
);

// export const getApplicationList = createAction(
//   AllFeatureActionTypes.GetApplicationList,
//   props<{ application: Model.Application }>()
// );

// export const getApplicationListSuccess = createAction(
//   AllFeatureActionTypes.GetApplicationListSuccess,
//   props<{ application: Model.Application[] }>()
// );

// export const getApplicationListFail = createAction(
//   AllFeatureActionTypes.GetApplicationListFail,
//   props<{ payload: any }>()
// );
