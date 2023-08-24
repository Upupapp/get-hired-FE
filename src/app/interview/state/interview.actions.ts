import {
  createAction,
  props
} from "@ngrx/store";
import * as Model from '../interview.model';

enum AllFeatureActionTypes {
  GetInterviewList = '[interview] - Get Interview List',
  GetInterviewListSuccess = '[interview] - Get Interview List Success',
  GetInterviewListFail = '[interview] - Get Interview List Fail',
  GetInterviewTemplatesList = '[interview] - Get Interview Templates List',
  GetInterviewTemplatesListSuccess = '[interview] - Get Interview Templates List Success',
  GetInterviewTemplatesListFail = '[interview] - Get Interview Templates List Fail',
  GetInterviewRecipientList = '[interview] - Get Interview Recipient List',
  GetInterviewRecipientListSuccess = '[interview] - Get Interview Recipient List Success',
  GetInterviewRecipientListFail = '[interview] - Get Interview Recipient List Fail',
  GetInterviewTemplateQuestions = '[interview] - Get Interview Template Questions',
  GetInterviewTemplateQuestionsSuccess = '[interview] - Get Interview Template Questions Success',
  GetInterviewTemplateQuestionsFail = '[interview] - Get Interview Template Questions Fail',
  SaveGroupInterview = '[interview] - Save Group Interview',
  SaveGroupInterviewSuccess = '[interview] - Save Group Interview Succss',
  SaveGroupInterviewFail  = '[interview] - Save Group Interview Fail',
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

export const getInterviewTemplatesList = createAction(
  AllFeatureActionTypes.GetInterviewTemplatesList,
  props<{ companyId: string }>()
);

export const getInterviewTemplatesListSuccess = createAction(
  AllFeatureActionTypes.GetInterviewTemplatesListSuccess,
  props<{ interviewTemplates: Model.InterviewQuestionTemplate[] }>()
);

export const getInterviewTemplatesListFail = createAction(
  AllFeatureActionTypes.GetInterviewTemplatesListFail,
  props<{ payload: any }>()
);

export const getInterviewRecipientList = createAction(
  AllFeatureActionTypes.GetInterviewRecipientList,
  props<{ companyId: string }>()
);

export const getInterviewRecipientListSuccess = createAction(
  AllFeatureActionTypes.GetInterviewRecipientListSuccess,
  props<{ interviewRecipient: Model.InterviewRecipients }>()
);

export const getInterviewRecipientListFail = createAction(
  AllFeatureActionTypes.GetInterviewRecipientListFail,
  props<{ payload: any }>()
);

export const getInterviewTemplateQuestions = createAction(
  AllFeatureActionTypes.GetInterviewTemplateQuestions,
  props<{ templateId: string }>()
);

export const getInterviewTemplateQuestionsSuccess = createAction(
  AllFeatureActionTypes.GetInterviewTemplateQuestionsSuccess,
  props<{ interviewTemplateQuestions: Model.InterviewQuestion[] }>()
);

export const getInterviewTemplateQuestionsFail = createAction(
  AllFeatureActionTypes.GetInterviewTemplateQuestionsFail,
  props<{ payload: any }>()
);


export const saveGroupInterview = createAction(
  AllFeatureActionTypes.SaveGroupInterview,
  props<{ interview: Model.GroupInterview }>()
);

export const saveGroupInterviewSuccess = createAction(
  AllFeatureActionTypes.SaveGroupInterviewSuccess,
  props<{ interview: Model.GroupInterview }>()
);

export const saveGroupInterviewFail = createAction(
  AllFeatureActionTypes.SaveGroupInterviewFail,
  props<{ payload: any }>()
);
