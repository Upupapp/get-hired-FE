import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { catchError, map, mergeMap, switchMap } from 'rxjs/operators';
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

  saveBasicProfile$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ApplicantActions.saveApplicantBasicProfile),
      mergeMap((action) => this.applicantService.saveApplicantBasicProfile(action.basicProfile)
        .pipe(
          map((res: any) => {
            const basicProfile: Model.BasicProfileInfo = res.data;
            return ApplicantActions.saveApplicantBasicProfileSuccess({ basicProfile })
          }),
          catchError((err) => {
            const { error } = err.error;
            return of(ApplicantActions.saveApplicantBasicProfileFail({ payload: error }))
          })
        ))
    )
  });

  saveSkills$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ApplicantActions.saveProfessionalSkills),
      mergeMap((action) => this.applicantService.saveProfessionalSkills(action.skills, action.profileId)
        .pipe(
          map((res: any) => {
            const skills: string[] = res.data;
            return ApplicantActions.saveProfessionalSkillsSuccess({ skills })
          }),
          catchError((err) => {
            const { error } = err.error;
            return of(ApplicantActions.saveProfessionalSkillsFail({ payload: error }))
          })
        ))
    )
  });

  saveWorkExperience$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ApplicantActions.saveWorkExperience),
      mergeMap((action) => this.applicantService.saveWorkExperience(action.workExperience, action.profileId)
        .pipe(
          map((res: any) => {
            const workExperience: Model.WorkExperience[] = res.data;
            return ApplicantActions.saveWorkExperienceSuccess({ workExperience })
          }),
          catchError((err) => {
            const { error } = err.error;
            return of(ApplicantActions.saveWorkExperienceFail({ payload: error }))
          })
        ))
    )
  });

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

  applicantDashboard$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ApplicantActions.applicantDashboard),
      mergeMap(() => this.applicantService.getDashboardDetails()
        .pipe(
          map((res: any) => {
            const dashboard: Model.Dashboard = res.data;
            return ApplicantActions.applicantDashboardSuccess({ dashboard });
          }),
          catchError((err) => {
            const { error } = err.error;
            return of(ApplicantActions.applicantDashboardFail({ payload: error }))
          })
        )
      )
    );
  });

  getApplicantDetails$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ApplicantActions.getApplicant),
      mergeMap((action) => this.applicantService.getApplicant(action.applicantId)
        .pipe(
          map((res: any) => {
            const applicant: Model.Applicant = res.data;
            return ApplicantActions.getApplicantSuccess({ applicant })
          }),
          catchError((err) => {
            const { error } = err;
            return of(ApplicantActions.getApplicantFail({ payload: error }));
          })
        )
      )
    );
  });

  // getApplicantDetails$ = createEffect(() => {
  //   return this.actions$.pipe(
  //     ofType(ApplicantActions.getApplicant),
  //     mergeMap((action) => this.applicantService.getApplicant(action.applicantId)
  //       .pipe(
  //         switchMap((res: any) => {
  //           const applicant: Model.Applicant = res.data;
  //           return [
  //             ApplicantActions.getApplicantSuccess({ applicant }),
  //             ApplicantActions.setInitialDetails({
  //               initialDetails: this.getInitialDetailsOfApplicant(applicant)
  //             }),
  //             ApplicantActions.setAdditionalInfo({
  //               additionalInfo: this.getJobInfo(applicant)
  //             }),
  //             ApplicantActions.setProfileDocuments({
  //               profileDocs: {
  //                 documents: applicant.documents,
  //                 videoCVUrl: applicant.videoCVUrl
  //               }
  //             })
  //           ];
  //         }),
  //         catchError((err) => {
  //           const { error } = err;
  //           return of(ApplicantActions.getApplicantFail({ payload: error }));
  //         })
  //       )
  //     )
  //   );
  // });

  createApplicantDetails$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ApplicantActions.saveApplicant),
      mergeMap((action) => this.applicantService.saveApplicant(action.applicant)
        .pipe(
          map((res: any) => {
            const applicant: Model.Applicant = res.data;
            return ApplicantActions.saveApplicantSuccess({ applicant });
          }),
          catchError((err) => {
            const { error } = err.error;
            return of(ApplicantActions.saveApplicantFail({ payload: error }));
          })
        )
      )
    );
  });

  getInitialDetailsOfApplicant(applicant: Model.Applicant): Model.InitialDetails {
    return {
      profilePhoto: applicant.photoUrl,
      jobTitle: applicant.jobTitle,
      shortBio: applicant.shortBio,
      servicesProvided: applicant.servicesProvided,
      jobTypeId: applicant.jobTypeId,
      jobLevelId: applicant.jobLevelId,
      workSetupId: applicant.workSetUpId,
      salaryMinimum: applicant.salaryMinimum,
      salaryMaximum: applicant.salaryMaximum,
      firstName: applicant.firstName,
      lastName: applicant.lastName,
      address: applicant.address,
      contactNumber: applicant.contactNumber,
      city: applicant.city,
      country: applicant.country
    }
  }

  getJobInfo(applicant: Model.Applicant): Model.AdditionalInfo {
    return {
      workExperience: applicant.workExperience,
      educationalBackground: applicant.educationalBackground,
      professionalSkills: applicant.skills,
      certifications: applicant.certifications
    }
  }

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

    user$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(ApplicantActions.getUserProfile),
        mergeMap((action) => this.applicantService.userProfile(action.userId)
          .pipe(
            map((res: any) => {
              const user: Model.User = res.data;
              return ApplicantActions.getUserProfileSuccess({ user });
            }),
            catchError((err) => {
              const { error } = err.error;
              return of(ApplicantActions.getUserProfileFail({ payload: error }))
            })
          )
        )
      );
    });

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
