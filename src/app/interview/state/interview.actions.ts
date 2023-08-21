import {
  createAction,
  props
} from "@ngrx/store";
import * as Model from '../interview.model';

enum AllFeatureActionTypes {
  GetInterviewList = '[job] - Get Interview List',
  GetInterviewListSuccess = '[job] - Get Interview List Success',
  GetInterviewListFail = '[job] - Get Interview List Fail',
};

export const getInterviewList = createAction(
  AllFeatureActionTypes.GetInterviewList,
  props<{ companyId: string }>()
);

export const getInterviewListSuccess = createAction(
  AllFeatureActionTypes.GetInterviewListSuccess,
  props<{ interviews: Model.GroupInterview[] }>()
);

export const getInterviewListFail = createAction(
  AllFeatureActionTypes.GetInterviewListFail,
  props<{ payload: any }>()
);
