import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { Actions, ofType, createEffect } from '@ngrx/effects';
import * as ApplicantActions from './applicant.actions';
import * as Model from '../applicant.model';
import { ApplicantService } from '../applicant.service';

@Injectable()
export class ApplicantEffects {
  constructor(
    private applicantService: ApplicantService,
    private actions$: Actions
  ) { }

  // getAllApplicant$ = createEffect(() => {
  //   return this.actions$.pipe(
  //     ofType(ApplicantActions.getAllapplicant),
  //     mergeMap(() => this.applicantService.getAllApplicant()
  //       .pipe(
  //         map((res: any) => {
  //           const applicant: Model.Applicant[] = res.data;
  //           return ApplicantActions.getAllapplicantSuccess({ applicant });
  //         }),
  //         catchError((err) => {
  //           const { error } = err.error;
  //           return of(ApplicantActions.getAllapplicantFail({ payload: error }))
  //         })
  //       )
  //     )
  //   );
  // });

  getApplicantDetails$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ApplicantActions.getApplicant),
      mergeMap((action) => this.applicantService.getApplicant(action.applicantId)
        .pipe(
          map((res: any) => {
            const applicant: Model.Applicant = res.data;
            return ApplicantActions.getApplicantSuccess({ applicant });
          }),
          catchError((err) => {
            const { error } = err.error;
            return of(ApplicantActions.getApplicantFail({ payload: error }));
          })
        )
      )
    );
  });

  createApplicantDetails$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ApplicantActions.createApplicant),
      mergeMap((action) => this.applicantService.createApplicant(action.applicant)
        .pipe(
          map((res: any) => {
            const applicant: Model.Applicant = res.data;
            return ApplicantActions.createApplicantSuccess({ applicant });
          }),
          catchError((err) => {
            const { error } = err.error;
            return of(ApplicantActions.createApplicantFail({ payload: error }));
          })
        )
      )
    );
  });

  // updateApplicantProfile$ = createEffect(() => {
  //   return this.actions$.pipe(
  //     ofType(ApplicantActions.updateProfile),
  //     mergeMap((action) => this.applicantService.updateApplicantProfile(action.userProfile)
  //       .pipe(
  //         map((res: any) => {
  //           const profile: Model.Applicant = res.data;
  //           return ApplicantActions.updateProfileSuccess({ profile });
  //         }),
  //         catchError((err) => {
  //           const { error } = err.error;
  //           return of(ApplicantActions.updateProfileFail({ payload: error }))
  //         })
  //       )
  //     )
  //   );
  // });

  //   applicant$ = createEffect(() => {
  //     return this.actions$.pipe(
  //       ofType(ApplicantActions.saveApplicant),
  //       mergeMap((action) => this.applicantService.saveApplicant(action.applicant)
  //         .pipe(
  //           map((res: any) => {
  //             const applicant: Model.Applicant = res.data;
  //             return ApplicantActions.saveApplicantSuccess({ applicant });
  //           }),
  //           catchError((err) => {
  //             const { error } = err.error;
  //             return of(ApplicantActions.saveApplicantFail({ payload: error }))
  //           })
  //         )
  //       )
  //     );
  //   });

  //   basicList$ = createEffect(() => {
  //     return this.actions$.pipe(
  //       ofType(ApplicantActions.getBasicApplicantList),
  //       mergeMap((action) => this.applicantService.getApplicantBasicList(action.companyId)
  //         .pipe(
  //           map((res: any) => {
  //             const basicList: Model.BasicList[] = res.data;
  //             return ApplicantActions.getBasicApplicantListSuccess({ basicList });
  //           }),
  //           catchError((err) => {
  //             const { error } = err.error;
  //             return of(ApplicantActions.getBasicApplicantListFail({ payload: error }))
  //           })
  //         )
  //       )
  //     );
  //   });

  //   expiredList$ = createEffect(() => {
  //     return this.actions$.pipe(
  //       ofType(ApplicantActions.getExpiredApplicantList),
  //       mergeMap((action) => this.applicantService.getApplicantExpiredList(action.companyId)
  //         .pipe(
  //           map((res: any) => {
  //             const expiredList: Model.BasicList[] = res.data;
  //             return ApplicantActions.getExpiredApplicantListSuccess({ expiredList });
  //           }),
  //           catchError((err) => {
  //             const { error } = err.error;
  //             return of(ApplicantActions.getExpiredApplicantListFail({ payload: error }))
  //           })
  //         )
  //       )
  //     );
  //   });

  //   changeApplicantStatus$ = createEffect(() => {
  //     return this.actions$.pipe(
  //       ofType(ApplicantActions.changeApplicantStatus),
  //       mergeMap((action) => this.applicantService.changeApplicantStatus(action.status, action.applicantId)
  //         .pipe(
  //           map((res: any) => {
  //             const applicant: Model.Applicant = res.data;
  //             return ApplicantActions.changeApplicantStatusSuccess({ applicant });
  //           }),
  //           catchError((err) => {
  //             const { error } = err.error;
  //             return of(ApplicantActions.changeApplicantStatusFail({ payload: error }))
  //           })
  //         )
  //       )
  //     );
  //   });

  //   categoryList$ = createEffect(() => {
  //     return this.actions$.pipe(
  //       ofType(ApplicantActions.getCategoryList),
  //       mergeMap(() => this.applicantService.getCategoryList()
  //         .pipe(
  //           map((res: any) => {
  //             const category: Model.Options[] = res.data;
  //             return ApplicantActions.getCategoryListSuccess({ category });
  //           }),
  //           catchError((err) => {
  //             const { error } = err.error;
  //             return of(ApplicantActions.getCategoryListFail({ payload: error }))
  //           })
  //         )
  //       )
  //     );
  //   });

  //   industryList$ = createEffect(() => {
  //     return this.actions$.pipe(
  //       ofType(ApplicantActions.getIndustryList),
  //       mergeMap(() => this.applicantService.getIndustryList()
  //         .pipe(
  //           map((res: any) => {
  //             const industry: Model.Options[] = res.data;
  //             return ApplicantActions.getIndustryListSuccess({ industry });
  //           }),
  //           catchError((err) => {
  //             const { error } = err.error;
  //             return of(ApplicantActions.getIndustryListFail({ payload: error }))
  //           })
  //         )
  //       )
  //     );
  //   });

  //   badgeList$ = createEffect(() => {
  //     return this.actions$.pipe(
  //       ofType(ApplicantActions.getBadgeList),
  //       mergeMap(() => this.applicantService.getBadgeList()
  //         .pipe(
  //           map((res: any) => {
  //             const badge: Model.Options[] = res.data;
  //             return ApplicantActions.getBadgeListSuccess({ badge });
  //           }),
  //           catchError((err) => {
  //             const { error } = err.error;
  //             return of(ApplicantActions.getBadgeListFail({ payload: error }))
  //           })
  //         )
  //       )
  //     );
  //   });

  //   applicantRoleList$ = createEffect(() => {
  //     return this.actions$.pipe(
  //       ofType(ApplicantActions.getApplicantRoleList),
  //       mergeMap(() => this.applicantService.getApplicantRoleList()
  //         .pipe(
  //           map((res: any) => {
  //             const applicantRole: Model.Options[] = res.data;
  //             return ApplicantActions.getApplicantRoleListSuccess({ applicantRole });
  //           }),
  //           catchError((err) => {
  //             const { error } = err.error;
  //             return of(ApplicantActions.getApplicantRoleListFail({ payload: error }))
  //           })
  //         )
  //       )
  //     );
  //   });

    setupList$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(ApplicantActions.getSetupList),
        mergeMap(() => this.applicantService.getSetupList()
          .pipe(
            map((res: any) => {
              const setup: Model.Options[] = res.data;
              return ApplicantActions.getSetupListSuccess({ setup });
            }),
            catchError((err) => {
              const { error } = err.error;
              return of(ApplicantActions.getSetupListFail({ payload: error }))
            })
          )
        )
      );
    });

    typeList$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(ApplicantActions.getTypeList),
        mergeMap(() => this.applicantService.getTypeList()
          .pipe(
            map((res: any) => {
              const typeList: Model.Options[] = res.data;
              return ApplicantActions.getTypeListSuccess({ typeList });
            }),
            catchError((err) => {
              const { error } = err.error;
              return of(ApplicantActions.getTypeListFail({ payload: error }))
            })
          )
        )
      );
    });

    levelList$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(ApplicantActions.getLevelList),
        mergeMap(() => this.applicantService.getLevelList()
          .pipe(
            map((res: any) => {
              const level: Model.Options[] = res.data;
              return ApplicantActions.getLevelListSuccess({ level });
            }),
            catchError((err) => {
              const { error } = err.error;
              return of(ApplicantActions.getLevelListFail({ payload: error }))
            })
          )
        )
      );
    });

  //   getApplicant$ = createEffect(() => {
  //     return this.actions$.pipe(
  //       ofType(ApplicantActions.getApplicant),
  //       mergeMap((action) => this.applicantService.getApplicantById(action.applicantId)
  //         .pipe(
  //           map((res: any) => {
  //             const applicant: Model.Applicant = res.data;
  //             return ApplicantActions.getApplicantSuccess({ applicant });
  //           }),
  //           catchError((err) => {
  //             const { error } = err.error;
  //             return of(ApplicantActions.getApplicantFail({ payload: error }))
  //           })
  //         )
  //       )
  //     );
  //   });
}
