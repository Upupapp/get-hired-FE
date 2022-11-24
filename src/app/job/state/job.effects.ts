import { Injectable } from '@angular/core';
import {
  of
} from 'rxjs';
import {
  catchError,
  map,
  mergeMap
} from 'rxjs/operators';
import {
  Actions,
  ofType,
  createEffect
} from '@ngrx/effects';
import * as JobActions from './job.actions';
import * as Model from '../job.model';
import { JobService } from '../job.service';

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
            const { error } = err.error;
            return of(JobActions.saveJobFail({ payload: error }))
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
            const { error } = err.error;
            return of(JobActions.changeJobStatusFail({ payload: error }))
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
          map((res: any) => {
            const job: Model.Job = res.data;
            return JobActions.getJobSuccess({ job });
          }),
          catchError((err) => {
            const { error } = err.error;
            return of(JobActions.getJobFail({ payload: error }))
          })
        )
      )
    );
  });
}
