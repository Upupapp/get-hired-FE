import { Injectable } from '@angular/core';
import {
  of
} from 'rxjs';
import {
  catchError,
  exhaustMap,
  map,
  mergeMap,
  switchMap
} from 'rxjs/operators';
import {
  Actions,
  ofType,
  createEffect
} from '@ngrx/effects';
import * as JobActions from './job.actions';
import * as Model from '../job.model';
import { JobService } from '../job.service';
import * as InterviewModel from '@main/interview/interview.model';

@Injectable()
export class JobEffects {

  constructor(
    private jobService: JobService,
    private actions$: Actions,
  ) { }

  // getAllJob$ = createEffect(() => {
  //   return this.actions$.pipe(
  //     ofType(JobActions.getAlljob),
  //     mergeMap(() => this.jobService.getAllJob()
  //       .pipe(
  //         map((res: any) => {
  //           const job: Model.Job[] = res.data;
  //           return JobActions.getAlljobSuccess({ job });
  //         }),
  //         catchError((err) => {
  //           const { error } = err.error;
  //           return of(JobActions.getAlljobFail({ payload: error }))
  //         })
  //       )
  //     )
  //   );
  // });

  // getJobDetails$ = createEffect(() => {
  //   return this.actions$.pipe(
  //     ofType(JobActions.getJobDetails),
  //     mergeMap((action) => this.jobService.getJobDetails(action.userId)
  //       .pipe(
  //         map((res: any) => {
  //           const profile: Model.Job = res.data;
  //           return JobActions.getJobDetailsSuccess({ profile });
  //         }),
  //         catchError((err) => {
  //           const { error } = err.error;
  //           return of(JobActions.getJobDetailsFail({ payload: error }))
  //         })
  //       )
  //     )
  //   );
  // });

  // updateJobProfile$ = createEffect(() => {
  //   return this.actions$.pipe(
  //     ofType(JobActions.updateProfile),
  //     mergeMap((action) => this.jobService.updateJobProfile(action.userProfile)
  //       .pipe(
  //         map((res: any) => {
  //           const profile: Model.Job = res.data;
  //           return JobActions.updateProfileSuccess({ profile });
  //         }),
  //         catchError((err) => {
  //           const { error } = err.error;
  //           return of(JobActions.updateProfileFail({ payload: error }))
  //         })
  //       )
  //     )
  //   );
  // });

  job$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(JobActions.saveJob),
      mergeMap((action) => this.jobService.saveJob(action.job)
        .pipe(
          map((res: any) => {
            const job: Model.Job = res.data;
            return JobActions.saveJobSuccess({ job });
          }),
          catchError((err) => {
            // BE 403 uses { message: "..." }; other BE errors use { error: "..." }.
            // Normalise so the reducer and UI always receive a string.
            const body = (err && err.error) || {};
            const payload: string = body.error || body.message || 'Unable to save your job. Please try again.';
            return of(JobActions.saveJobFail({ payload }))
          })
        )
      )
    );
  });

  getCompanySubscription$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(JobActions.getCompanySubscription),
      mergeMap((action) => this.jobService.checkCompanySubscription(action.companyId)
        .pipe(
          map((res: any) => {
            const subscription: Model.CompanySubscriptions = res.data;
            return JobActions.getCompanySubscriptionSuccess({ subscription });
          }),
          catchError((err) => {
            const { error } = err.error;
            return of(JobActions.getCompanySubscriptionFail({ payload: error }))
          })
        )
      )
    );
  });

  basicList$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(JobActions.getBasicJobList),
      mergeMap((action) => this.jobService.getJobBasicList(action.companyId)
        .pipe(
          map((res: any) => {
            const basicList: Model.BasicList[] = res.data;
            return JobActions.getBasicJobListSuccess({ basicList });
          }),
          catchError((err) => {
            const { error } = err.error;
            return of(JobActions.getBasicJobListFail({ payload: error }))
          })
        )
      )
    );
  });

  expiredList$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(JobActions.getExpiredJobList),
      mergeMap((action) => this.jobService.getJobExpiredList(action.companyId)
        .pipe(
          map((res: any) => {
            const expiredList: Model.BasicList[] = res.data;
            return JobActions.getExpiredJobListSuccess({ expiredList });
          }),
          catchError((err) => {
            const { error } = err.error;
            return of(JobActions.getExpiredJobListFail({ payload: error }))
          })
        )
      )
    );
  });

  changeJobStatus$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(JobActions.changeJobStatus),
      mergeMap((action) => this.jobService.changeJobStatus(action.status, action.jobId)
        .pipe(
          map((res: any) => {
            const job: Model.Job = res.data;
            return JobActions.changeJobStatusSuccess({ job });
          }),
          catchError((err) => {
            // BE 403 uses { message: "..." }; other BE errors use { error: "..." }.
            // Normalise so the reducer and UI always receive a string, and so a
            // 403 with { message: "..." } never causes a destructure crash.
            const body = (err && err.error) || {};
            const payload: string = body.error || body.message || 'Unable to update job status. Please try again.';
            return of(JobActions.changeJobStatusFail({ payload }))
          })
        )
      )
    );
  });

  categoryList$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(JobActions.getCategoryList),
      mergeMap(() => this.jobService.getCategoryList()
        .pipe(
          map((res: any) => {
            const category: Model.Options[] = res.data;
            return JobActions.getCategoryListSuccess({ category });
          }),
          catchError((err) => {
            const { error } = err.error;
            return of(JobActions.getCategoryListFail({ payload: error }))
          })
        )
      )
    );
  });

  industryList$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(JobActions.getIndustryList),
      mergeMap(() => this.jobService.getIndustryList()
        .pipe(
          map((res: any) => {
            const industry: Model.Options[] = res.data;
            return JobActions.getIndustryListSuccess({ industry });
          }),
          catchError((err) => {
            const { error } = err.error;
            return of(JobActions.getIndustryListFail({ payload: error }))
          })
        )
      )
    );
  });

  badgeList$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(JobActions.getBadgeList),
      mergeMap(() => this.jobService.getBadgeList()
        .pipe(
          map((res: any) => {
            const badge: Model.Options[] = res.data;
            return JobActions.getBadgeListSuccess({ badge });
          }),
          catchError((err) => {
            const { error } = err.error;
            return of(JobActions.getBadgeListFail({ payload: error }))
          })
        )
      )
    );
  });

  jobRoleList$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(JobActions.getJobRoleList),
      mergeMap(() => this.jobService.getJobRoleList()
        .pipe(
          map((res: any) => {
            const jobRole: Model.Options[] = res.data;
            return JobActions.getJobRoleListSuccess({ jobRole });
          }),
          catchError((err) => {
            const { error } = err.error;
            return of(JobActions.getJobRoleListFail({ payload: error }))
          })
        )
      )
    );
  });

  setupList$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(JobActions.getSetupList),
      mergeMap(() => this.jobService.getSetupList()
        .pipe(
          map((res: any) => {
            const setup: Model.Options[] = res.data;
            return JobActions.getSetupListSuccess({ setup });
          }),
          catchError((err) => {
            const { error } = err.error;
            return of(JobActions.getSetupListFail({ payload: error }))
          })
        )
      )
    );
  });

  typeList$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(JobActions.getTypeList),
      mergeMap(() => this.jobService.getTypeList()
        .pipe(
          map((res: any) => {
            const typeList: Model.Options[] = res.data;
            return JobActions.getTypeListSuccess({ typeList });
          }),
          catchError((err) => {
            const { error } = err.error;
            return of(JobActions.getTypeListFail({ payload: error }))
          })
        )
      )
    );
  });

  levelList$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(JobActions.getLevelList),
      mergeMap(() => this.jobService.getLevelList()
        .pipe(
          map((res: any) => {
            const level: Model.Options[] = res.data;
            return JobActions.getLevelListSuccess({ level });
          }),
          catchError((err) => {
            const { error } = err.error;
            return of(JobActions.getLevelListFail({ payload: error }))
          })
        )
      )
    );
  });

  getJob$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(JobActions.getJob),
      mergeMap((action) => this.jobService.getJobById(action.jobId)
        .pipe(
          switchMap((res: any) => {
            const job: Model.Job = res.data;
            return [
              JobActions.getJobSuccess({ job }),
              JobActions.setJobInitialDetails({
                initialDetails: this.getInitialDetailsOfJob(job)
              }),
              JobActions.setJobInfo({ jobInfo: this.getJobInfo(job) }),
              JobActions.setInterview({ interview: job.interviewQuestions, interviewTemplateId: job.interviewTemplateId })
            ];
          }),
          catchError((err) => {
            // BE 403/401 use { message: "..." }; other BE errors use { error: "..." }.
            // Normalise so the reducer and UI always receive a string.
            const body = (err && err.error) || {};
            const payload: string = body.error || body.message || 'Unable to load this job. Please try again.';
            return of(JobActions.getJobFail({ payload }))
          })
        )
      )
    );
  });

  getJobApplicants$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(JobActions.getJobApplicants),
      mergeMap((action) => this.jobService.getJobApplicantsByJobId(action.jobId)
        .pipe(
          map((res: any) => {
            const applicants: Model.JobApplicants[] = res.data;
            return JobActions.getJobApplicantsSuccess({ applicants });
          }),
          catchError((err) => {
            const { error } = err.error;
            return of(JobActions.getJobApplicantsFail({ payload: error }))
          })
        )
      )
    );
  });

  getJobApplicantDetails$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(JobActions.getJobApplicantDetails),
      mergeMap((action) => this.jobService.getJobApplicantDetails(action.jobId, action.userId)
        .pipe(
          map((res: any) => {
            const applicant: Model.JobApplicantDetails = res.data;
            return JobActions.getJobApplicantDetailsSuccess({ applicant });
          }),
          catchError((err) => {
            const { error } = err.error;
            return of(JobActions.getJobApplicantDetailsFail({ payload: error }))
          })
        )
      )
    );
  });

  updateJobInterviewQuestions$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(JobActions.updateJobQuestion),
      mergeMap((action) => this.jobService.updateJobInterviewQuestions(action.interviewQuestion)
        .pipe(
          map((res: any) => {
            const interviewQuestion: InterviewModel.InterviewQuestion = res.data;
            return JobActions.updateJobQuestionSuccess({ interviewQuestion });
          }),
          catchError((err) => {
            const { error } = err.error;
            return of(JobActions.updateJobQuestionFail({ payload: error }))
          })
        )
      )
    );
  });

  deleteJobInterviewQuestions$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(JobActions.deleteJobQuestion),
      mergeMap((action) => this.jobService.deleteJobInterviewQuestions(action.questionId, action.jobId)
        .pipe(
          map((res: any) => {
            const questions: InterviewModel.InterviewQuestion[] = res.data;
            return JobActions.deleteJobQuestionSuccess({ questions });
          }),
          catchError((err) => {
            const { error } = err.error;
            return of(JobActions.deleteJobQuestionFail({ payload: error }))
          })
        )
      )
    );
  });

  // P2 FIX: effect for the new job-level delete endpoint. On success the BE
  // returns the caller's updated job list (ownership-scoped). On failure the
  // BE returns 404 { error: "..." } or 403 { message: "..." }; both are
  // normalised to a string so the reducer and UI always receive readable copy.
  // OPTIMIZE: exhaustMap (not mergeMap) so rapid double-taps on "Delete" cannot
  // fire a second HTTP DELETE while the first is still in-flight. A second tap
  // is silently dropped, which is exactly the desired behaviour for a
  // destructive, non-idempotent operation.
  deleteJob$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(JobActions.deleteJob),
      exhaustMap((action) => this.jobService.deleteJobPost(action.jobId)
        .pipe(
          map((res: any) => {
            const basicList: Model.BasicList[] = res.data || [];
            return JobActions.deleteJobSuccess({ basicList });
          }),
          catchError((err) => {
            const body = (err && err.error) || {};
            const payload: string = body.error || body.message
              || 'We couldn\'t delete this job. It may no longer exist or you may not have access.';
            return of(JobActions.deleteJobFail({ payload }));
          })
        )
      )
    );
  });

  getInitialDetailsOfJob(job: Model.Job): Model.InitialDetails {
    return {
      jobTitle: job.jobTitle,
      jobTypeId: job.jobTypeId,
      jobLevelId: job.jobLevelId,
      workSetupId: job.workSetupId,
      jobAddress: job.jobAddress,
      jobCity: job.jobCity,
      jobCountry: job.jobCountry,
      jobBanner: job.jobBanner,
      bannerFile: job.bannerFile,
      badges: job.badges,
      jobDescription: job.jobDescription,
      jobDuties: job.jobDuties,
      requirements: job.requirements,
      goodToHave: job.goodToHave,
      educationalBackground: job.educationalBackground,
      jobCategoryId: job.jobCategoryId
    }
  }

  getJobInfo(job: Model.Job): Model.JobInfo {
    return {
      industryId: job.industryId,
      jobRoleId: job.jobRoleId,
      skills: job.skills,
      tags: job.tags,
      rate: job.rate,
      salaryMinimum: job.salaryMinimum,
      salaryMaximum: job.salaryMaximum,
      salaryCurrency: job.salaryCurrency
    }
  }
}
