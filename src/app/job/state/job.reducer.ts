import * as AppState from '@main/app.state';
import { createReducer, on } from '@ngrx/store';
import * as Model from '../job.model';
import * as JobActions from './job.actions';
import * as InterviewModel from '@main/interview/interview.model';

export interface State extends AppState.State {
  job: JobState;
}

export interface JobState {
  selected: Model.Job | null;
  list: Model.Job[] | Model.BasicList[];
  error: any;
  succesMsg: string;
  loading: boolean;
  industry: Model.Options[];
  badge: Model.Options[];
  jobRole: Model.Options[];
  setup: Model.Options[];
  typeList: Model.Options[];
  level: Model.Options[];
  category: Model.Options[];
  initialDetails: Model.InitialDetails;
  jobInfo: Model.JobInfo;
  interview: InterviewModel.InterviewQuestion[];
  interviewTemplateId: string;
  job: Model.Job | null;
  jobLoading: boolean;
  applicants: Model.JobApplicants[],
  applicant: Model.JobApplicantDetails;
  subs: Model.CompanySubscriptions
}

const initialState: JobState = {
  selected: null,
  list: [],
  error: null,
  succesMsg: null,
  loading: false,
  industry: [],
  badge: [],
  jobRole: [],
  setup: [],
  typeList: [],
  level: [],
  category: [],
  initialDetails: null,
  jobInfo: null,
  interview: [],
  interviewTemplateId: null,
  job: null,
  jobLoading: false,
  applicants: [],
  applicant: null,
  subs: null
}

export const jobReducer = createReducer<JobState>(
  initialState,
  on(JobActions.resetSuccessMsg, (state): JobState => {
    return {
      ...state,
      succesMsg: null
    };
  }),
  on(JobActions.changeJobStatus, (state): JobState => {
    return {
      ...state,
      loading: true,
      succesMsg: null
    };
  }),
  on(JobActions.changeJobStatusSuccess, (state, action): JobState => {
    return {
      ...state,
      selected: action.job,
      loading: false,
      succesMsg: action.job.jobStatusId == 4 ? 'archived' : 'expired'
    };
  }),
  on(JobActions.changeJobStatusFail, (state, action): JobState => {
    return {
      ...state,
      loading: false,
      error: action.payload,
      succesMsg: null
    };
  }),
  on(JobActions.getCompanySubscription, (state): JobState => {
    return {
      ...state,
      loading: true,
      error: null,
      succesMsg: null
    };
  }),
  on(JobActions.getCompanySubscriptionSuccess, (state, action): JobState => {
    return {
      ...state,
      loading: false,
      subs: action.subscription
    };
  }),
  on(JobActions.getCompanySubscriptionFail, (state, action): JobState => {
    return {
      ...state,
      loading: false,
      error: action.payload
    };
  }),
  on(JobActions.saveJob, (state): JobState => {
    return {
      ...state,
      loading: true,
      succesMsg: null
    };
  }),
  on(JobActions.saveJobSuccess, (state, action): JobState => {
    return {
      ...state,
      selected: action.job,
      loading: false,
      succesMsg: action.job.jobStatusId == 1 ? 'asDraft' : 'published'
    };
  }),
  on(JobActions.saveJobFail, (state, action): JobState => {
    return {
      ...state,
      loading: false,
      error: action.payload,
      succesMsg: null
    };
  }),
  on(JobActions.resetSuccessMsg, (state): JobState => {
    return {
      ...state,
      succesMsg: null,
      error: null
    };
  }),
  on(JobActions.resetJobForm, (state): JobState => {
    return {
      ...state,
      initialDetails: null,
      jobInfo: null,
      interview: null,
      interviewTemplateId: null,
      succesMsg: null,
      error: null
    };
  }),
  on(JobActions.setJobInitialDetails, (state, action): JobState => {
    return {
      ...state,
      initialDetails: {
        ...action.initialDetails,
        jobTypeId: action.initialDetails.jobTypeId as number,
        jobLevelId: action.initialDetails.jobLevelId as number,
        jobCategoryId: action.initialDetails.jobCategoryId as number,
        workSetupId: action.initialDetails.workSetupId as number
      }
    };
  }),
  on(JobActions.setJobInfo, (state, action): JobState => {
    return {
      ...state,
      jobInfo: action.jobInfo
    };
  }),
  on(JobActions.setInterview, (state, action): JobState => {
    return {
      ...state,
      interview: action.interview,
      interviewTemplateId: action.interviewTemplateId
    };
  }),
  on(JobActions.deleteJobQuestion, (state): JobState => {
    return {
      ...state,
      loading: true
    };
  }),
  on(JobActions.deleteJobQuestionSuccess, (state, action): JobState => {
    return {
      ...state,
      loading: false,
      succesMsg: 'deleted',
      // BUGFIX (production crash): state.selected is never populated for an
      // AI-Assistant-created job -- its initial persist (persistAssistantDraft
      // in job-create.component.ts) deliberately bypasses this facade/store,
      // calling JobService directly instead, specifically so the form isn't
      // reset out from under the Employer (see that method's own doc
      // comment). Deleting/editing a question afterward DOES go through
      // this facade though, so this case can run with state.selected still
      // null. `{...null}` is harmless (spreads to nothing) so this
      // particular line never crashed, but produced a nearly-empty
      // `selected` object with only interviewQuestions set -- fall back to
      // an empty object explicitly so that's at least clearly intentional.
      selected: {
        ...(state.selected || {}),
        interviewQuestions: action.questions
      } as Model.Job,
      interview: action.questions
    };
  }),
  on(JobActions.deleteJobQuestionFail, (state, action): JobState => {
    return {
      ...state,
      loading: false,
      error: action.payload
    };
  }),
  on(JobActions.updateJobQuestion, (state): JobState => {
    return {
      ...state,
      loading: true
    };
  }),
  on(JobActions.updateJobQuestionSuccess, (state, action): JobState => {
    // BUGFIX (production crash: "Cannot read properties of null (reading
    // 'interviewQuestions')"): state.selected is null for an AI-Assistant-
    // created job whose initial persist bypassed this store entirely (see
    // deleteJobQuestionSuccess's doc comment above, same root cause) --
    // editing a question afterward DOES route through this facade, so this
    // direct `state.selected.interviewQuestions.map(...)` crashed the
    // moment an Employer edited a question on one of those jobs, which
    // then left the app's NgRx effects pipeline in a broken state for
    // everything after it (explaining the follow-on Publish 422 -- not a
    // second bug, a downstream symptom of this crash). Fall back to
    // action.interviewQuestion alone (the one real, freshly-updated
    // question) when there was nothing to merge it into.
    const existingInterviews = (state.selected && state.selected.interviewQuestions) || [];
    const mappedInterviews = existingInterviews.length
      ? existingInterviews.map(question => {
          if (question.questionId == action.interviewQuestion.questionId) {
            return action.interviewQuestion
          }
          return question;
        })
      : [action.interviewQuestion];

    return {
      ...state,
      loading: false,
      selected: {
        ...(state.selected || {}),
        interviewQuestions: mappedInterviews
      } as Model.Job,
      interview: mappedInterviews,
      error: null,
      succesMsg: 'updated'
    };
  }),
  on(JobActions.updateJobQuestionFail, (state, action): JobState => {
    return {
      ...state,
      loading: false,
      error: action.payload
    };
  }),
  on(JobActions.getBasicJobList, (state): JobState => {
    return {
      ...state,
      loading: true
    };
  }),
  on(JobActions.getBasicJobListSuccess, (state, action): JobState => {
    return {
      ...state,
      loading: false,
      list: action.basicList,
      error: null,
      succesMsg: null
    };
  }),
  on(JobActions.getBasicJobListFail, (state, action): JobState => {
    return {
      ...state,
      loading: false,
      error: action.payload
    };
  }),
  on(JobActions.getExpiredJobList, (state): JobState => {
    return {
      ...state,
      loading: true
    };
  }),
  on(JobActions.getExpiredJobListSuccess, (state, action): JobState => {
    return {
      ...state,
      loading: false,
      list: action.expiredList,
      error: null,
    };
  }),
  on(JobActions.getExpiredJobListFail, (state, action): JobState => {
    return {
      ...state,
      loading: false,
      error: action.payload
    };
  }),
  on(JobActions.getCategoryList, (state): JobState => {
    return {
      ...state,
      loading: true
    };
  }),
  on(JobActions.getCategoryListSuccess, (state, action): JobState => {
    return {
      ...state,
      loading: false,
      category: action.category,
      error: null,
    };
  }),
  on(JobActions.getCategoryListFail, (state, action): JobState => {
    return {
      ...state,
      loading: false,
      error: action.payload
    };
  }),
  on(JobActions.getIndustryList, (state): JobState => {
    return {
      ...state,
      loading: true
    };
  }),
  on(JobActions.getIndustryListSuccess, (state, action): JobState => {
    return {
      ...state,
      loading: false,
      industry: action.industry,
      error: null,
    };
  }),
  on(JobActions.getIndustryListFail, (state, action): JobState => {
    return {
      ...state,
      loading: false,
      error: action.payload
    };
  }),
  on(JobActions.getBadgeList, (state): JobState => {
    return {
      ...state,
      loading: true
    };
  }),
  on(JobActions.getBadgeListSuccess, (state, action): JobState => {
    return {
      ...state,
      loading: false,
      badge: action.badge,
      error: null,
    };
  }),
  on(JobActions.getBadgeListFail, (state, action): JobState => {
    return {
      ...state,
      loading: false,
      error: action.payload
    };
  }),
  on(JobActions.getJobRoleList, (state): JobState => {
    return {
      ...state,
      loading: true
    };
  }),
  on(JobActions.getJobRoleListSuccess, (state, action): JobState => {
    return {
      ...state,
      loading: false,
      jobRole: action.jobRole,
      error: null,
    };
  }),
  on(JobActions.getJobRoleListFail, (state, action): JobState => {
    return {
      ...state,
      loading: false,
      error: action.payload
    };
  }),
  on(JobActions.getSetupList, (state): JobState => {
    return {
      ...state,
      loading: true
    };
  }),
  on(JobActions.getSetupListSuccess, (state, action): JobState => {
    return {
      ...state,
      loading: false,
      setup: action.setup,
      error: null,
    };
  }),
  on(JobActions.getSetupListFail, (state, action): JobState => {
    return {
      ...state,
      loading: false,
      error: action.payload
    };
  }),
  on(JobActions.getTypeList, (state): JobState => {
    return {
      ...state,
      loading: true
    };
  }),
  on(JobActions.getTypeListSuccess, (state, action): JobState => {
    return {
      ...state,
      loading: false,
      typeList: action.typeList,
      error: null,
    };
  }),
  on(JobActions.getTypeListFail, (state, action): JobState => {
    return {
      ...state,
      loading: false,
      error: action.payload
    };
  }),
  on(JobActions.getLevelList, (state): JobState => {
    return {
      ...state,
      loading: true
    };
  }),
  on(JobActions.getLevelListSuccess, (state, action): JobState => {
    return {
      ...state,
      loading: false,
      level: action.level,
      error: null,
    };
  }),
  on(JobActions.getLevelListFail, (state, action): JobState => {
    return {
      ...state,
      loading: false,
      error: action.payload
    };
  }),
  on(JobActions.getJob, (state): JobState => {
    return {
      ...state,
      jobLoading: true,
      error: null,
      succesMsg: null
    };
  }),
  on(JobActions.getJobSuccess, (state, action): JobState => {
    return {
      ...state,
      job: action.job,
      // PRODUCTION FIX: this is the response from getJobById() -- the
      // "load an existing job to edit it" flow -- but state.selected was
      // never actually set here. state.selected is the ONLY thing
      // job-create.component.ts's editJob$ subscription reads to build
      // the form (jobDetails$ -> getJobDetails selector -> state.selected);
      // every other reducer case here that sets state.selected is a
      // save/publish/question-edit success, none of which fire on a plain
      // load. The Update Job page's form was never actually being
      // populated from this action at all -- setFormGroup(data) either
      // never ran, or ran against stale leftover state.selected data from
      // an unrelated earlier action in the same session. action.job is
      // the complete, already-mapped job record (job.service.js's
      // mappedJob()) -- the exact same shape state.selected holds
      // everywhere else, so this is a direct, safe assignment.
      selected: action.job,
      jobLoading: false,
      succesMsg: null  // QA7 FIX-8: loading a job must not pollute succesMsg with a stale status string
    };
  }),
  on(JobActions.getJobFail, (state, action): JobState => {
    return {
      ...state,
      jobLoading: false,
      error: action.payload,
      succesMsg: null
    };
  }),
  on(JobActions.getJobApplicants, (state): JobState => {
    return {
      ...state,
      jobLoading: true,
      succesMsg: null
    };
  }),
  on(JobActions.getJobApplicantsSuccess, (state, action): JobState => {
    return {
      ...state,
      applicants: action.applicants,
      jobLoading: false,
    };
  }),
  on(JobActions.getJobApplicantsFail, (state, action): JobState => {
    return {
      ...state,
      jobLoading: false,
      error: action.payload,
      succesMsg: null
    };
  }),
  on(JobActions.getJobApplicantDetails, (state): JobState => {
    return {
      ...state,
      jobLoading: true,
      succesMsg: null
    };
  }),
  on(JobActions.getJobApplicantDetailsSuccess, (state, action): JobState => {
    return {
      ...state,
      applicant: action.applicant,
      jobLoading: false,
    };
  }),
  on(JobActions.getJobApplicantDetailsFail, (state, action): JobState => {
    return {
      ...state,
      jobLoading: false,
      error: action.payload,
      succesMsg: null
    };
  }),
  // P2 FIX: job-level delete reducer handlers.
  // deleteJob: spinner on, clear previous success/error so the UI is clean.
  on(JobActions.deleteJob, (state): JobState => {
    return {
      ...state,
      loading: true,
      succesMsg: null,
      error: null
    };
  }),
  // deleteJobSuccess: replace list with the BE-returned refreshed list
  // (scoped to the caller's company), surface 'deleted' success signal.
  on(JobActions.deleteJobSuccess, (state, action): JobState => {
    return {
      ...state,
      loading: false,
      list: action.basicList,
      succesMsg: 'deleted',
      error: null
    };
  }),
  // deleteJobFail: surface the normalised error string for the UI snackbar.
  on(JobActions.deleteJobFail, (state, action): JobState => {
    return {
      ...state,
      loading: false,
      error: action.payload,
      succesMsg: null
    };
  }),
);
