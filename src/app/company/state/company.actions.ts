import {
  createAction,
  props
} from "@ngrx/store";
import * as Model from '../company.model';

enum AllFeatureActionTypes {
  GetAllCompany = '[company] - Get All Job Order',
  GetAllCompanySuccess = '[company] - Get All Job Order Success',
  GetAllCompanyFail = '[company] - Get All Job Order Fail',
}

export const getAllcompany = createAction(
  AllFeatureActionTypes.GetAllCompany,
);

export const getAllcompanySuccess = createAction(
  AllFeatureActionTypes.GetAllCompanySuccess,
  props<{ company: Model.Company[] }>()
);

export const getAllcompanyFail = createAction(
  AllFeatureActionTypes.GetAllCompanyFail,
  props<{ payload: any }>()
);

// export const createFeature = createAction(
//   AllFeatureActionTypes.CreateFeature,
//   props<{ feature: Model.Company }>()
// );

// export const createFeatureSuccess = createAction(
//   AllFeatureActionTypes.CreateFeatureSuccess,
//   props<{ payload: any }>()
// );

// export const createFeatureFail = createAction(
//   AllFeatureActionTypes.CreateFeatureFail,
//   props<{ payload: any }>()
// );
