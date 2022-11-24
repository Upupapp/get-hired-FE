import {
  createAction,
  props
} from "@ngrx/store";
import * as Model from '../jobs.model';

enum AllFeatureActionTypes {
  GetPublishedJobList = '[job] - Get Published Job List',
  GetPublishedJobListSuccess = '[job] - Get Published Job List Success',
  GetPublishedJobListFail = '[job] - Get Published Job List Fail',
};

export const getPublishedJobList = createAction(
  AllFeatureActionTypes.GetPublishedJobList,
  props<{ companyId: string }>()
);

export const getPublishedJobListSuccess = createAction(
  AllFeatureActionTypes.GetPublishedJobListSuccess,
  props<{ publishedJobs: Model.BasicJob[] }>()
);

export const getPublishedJobListFail = createAction(
  AllFeatureActionTypes.GetPublishedJobListFail,
  props<{ payload: any }>()
);
