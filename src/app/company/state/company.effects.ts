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
import * as CompanyActions from './company.actions';
import * as Model from '../company.model';
import { CompanyService } from '../company.service';

@Injectable()
export class CompanyEffects {

  constructor(
    private companyService: CompanyService,
    private actions$: Actions,
  ) { }

  // getAllCompany$ = createEffect(() => {
  //   return this.actions$.pipe(
  //     ofType(CompanyActions.getAllcompany),
  //     mergeMap(() => this.companyService.getAllCompany()
  //       .pipe(
  //         map((res: any) => {
  //           const company: Model.Company[] = res.data;
  //           return CompanyActions.getAllcompanySuccess({ company });
  //         }),
  //         catchError((err) => {
  //           const { error } = err.error;
  //           return of(CompanyActions.getAllcompanyFail({ payload: error }))
  //         })
  //       )
  //     )
  //   );
  // });

  createCompany$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CompanyActions.createCompany),
      mergeMap((action) => this.companyService.createCompany(action.company)
        .pipe(
          map((res: any) => {
            const company: Model.Company = res.data;
            return CompanyActions.createCompanySuccess({ company });
          }),
          catchError((err) => {
            const payload = (err && err.error && err.error.error) || (err && err.message) || 'An error occurred';
            return of(CompanyActions.createCompanyFail({ payload }))
          })
        )
      )
    );
  });

  createInitialCompany$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CompanyActions.createInitialCompany),
      mergeMap((action) => this.companyService.createInitialCompany(action.companyName, action.companyEmail)
        .pipe(
          map((res: any) => {
            const company: Model.Company = res.data;
            return CompanyActions.createInitialCompanySuccess({ company });
          }),
          catchError((err) => {
            const payload = (err && err.error && err.error.error) || (err && err.message) || 'An error occurred';
            return of(CompanyActions.createInitialCompanyFail({ payload }))
          })
        )
      )
    );
  });

  updateCompany$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CompanyActions.updateCompany),
      mergeMap((action) => this.companyService.updateCompany(action.company)
        .pipe(
          map((res: any) => {
            const company: Model.Company = res.data;
            return CompanyActions.updateCompanySuccess({ company });
          }),
          catchError((err) => {
            // Pass the full error body + httpStatus so afterError() can route
            // to the correct modal state (network/permission/validation/generic).
            const errBody = (err && err.error) ? err.error : null;
            const payload = Object.assign(
              {},
              errBody || { error: (err && err.message) || 'An error occurred' },
              { httpStatus: err ? err.status : undefined }
            );
            return of(CompanyActions.updateCompanyFail({ payload }))
          })
        )
      )
    );
  });

  getCompany$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CompanyActions.getCompany),
      mergeMap(() => this.companyService.getUserCompany()
        .pipe(
          map((res: any) => {
            const company: Model.Company = res.data;
            return CompanyActions.getCompanySuccess({ company });
          }),
          catchError((err) => {
            const payload = (err && err.error && err.error.error) || (err && err.message) || 'An error occurred';
            return of(CompanyActions.getCompanyFail({ payload }))
          })
        )
      )
    );
  });

  getCompanyUsers$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CompanyActions.getCompanyUsers),
      mergeMap((action) => this.companyService.getCompanyUsers(action.companyId)
        .pipe(
          map((res: any) => {
            const users: Model.CompanyUser[] = res.data;
            return CompanyActions.getCompanyUsersSuccess({ users });
          }),
          catchError((err) => {
            const payload = (err && err.error && err.error.error) || (err && err.message) || 'An error occurred';
            return of(CompanyActions.getCompanyUsersFail({ payload }))
          })
        )
      )
    );
  });

  getCompanySubscription$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CompanyActions.getCompanySubscription),
      mergeMap((action) => this.companyService.checkCompanySubscription(action.companyId)
        .pipe(
          map((res: any) => {
            const subscription: Model.CompanySubscriptions = res.data;
            return CompanyActions.getCompanySubscriptionSuccess({ subscription });
          }),
          catchError((err) => {
            const payload = (err && err.error && err.error.error) || (err && err.message) || 'An error occurred';
            return of(CompanyActions.getCompanySubscriptionFail({ payload }))
          })
        )
      )
    );
  });

  companyDashboard$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CompanyActions.companyDashboard),
      mergeMap(() => this.companyService.getDashboardDetails()
        .pipe(
          map((res: any) => {
            const dashboard: Model.Dashboard = res.data;
            return CompanyActions.companyDashboardSuccess({ dashboard });
          }),
          catchError((err) => {
            const payload = (err && err.error && err.error.error) || (err && err.message) || 'An error occurred';
            return of(CompanyActions.companyDashboardFail({ payload }))
          })
        )
      )
    );
  });

  setupList$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CompanyActions.getSetupList),
      mergeMap(() => this.companyService.getSetupList()
        .pipe(
          map((res: any) => {
            const setup: Model.Options[] = res.data;
            return CompanyActions.getSetupListSuccess({ setup });
          }),
          catchError((err) => {
            const payload = (err && err.error && err.error.error) || (err && err.message) || 'An error occurred';
            return of(CompanyActions.getSetupListFail({ payload }))
          })
        )
      )
    );
  });

  industryList$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CompanyActions.getIndustryList),
      mergeMap(() => this.companyService.getIndustryList()
        .pipe(
          map((res: any) => {
            const industry: Model.Options[] = res.data;
            return CompanyActions.getIndustryListSuccess({ industry });
          }),
          catchError((err) => {
            const payload = (err && err.error && err.error.error) || (err && err.message) || 'An error occurred';
            return of(CompanyActions.getIndustryListFail({ payload }))
          })
        )
      )
    );
  });

  getTeamRoles$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CompanyActions.getTeamRoles),
      mergeMap(() => this.companyService.getTeamRoles()
        .pipe(
          map((res: any) => CompanyActions.getTeamRolesSuccess({ roles: res.data })),
          catchError((err) => {
            const payload = (err && err.error && err.error.error) || (err && err.message) || 'An error occurred';
            return of(CompanyActions.getTeamRolesFail({ payload }))
          })
        )
      )
    );
  });

  getPendingInvites$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CompanyActions.getPendingInvites),
      mergeMap(() => this.companyService.getPendingInvites()
        .pipe(
          map((res: any) => CompanyActions.getPendingInvitesSuccess({ invites: res.data })),
          catchError((err) => {
            const payload = (err && err.error && err.error.error) || (err && err.message) || 'An error occurred';
            return of(CompanyActions.getPendingInvitesFail({ payload }))
          })
        )
      )
    );
  });

  inviteTeamMembers$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CompanyActions.inviteTeamMembers),
      mergeMap((action) => this.companyService.inviteTeamMembers(action.invites)
        .pipe(
          map((res: any) => CompanyActions.inviteTeamMembersSuccess({ companyId: res.data.companyId, invites: res.data.invites })),
          catchError((err) => {
            const payload = (err && err.error && err.error.error) || (err && err.message) || 'An error occurred';
            return of(CompanyActions.inviteTeamMembersFail({ payload }))
          })
        )
      )
    );
  });

  revokeInvite$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CompanyActions.revokeInvite),
      mergeMap((action) => this.companyService.revokeInvite(action.invitationId)
        .pipe(
          map(() => CompanyActions.revokeInviteSuccess({ invitationId: action.invitationId })),
          catchError((err) => {
            const payload = (err && err.error && err.error.error) || (err && err.message) || 'An error occurred';
            return of(CompanyActions.revokeInviteFail({ payload }))
          })
        )
      )
    );
  });

  updateTeamMember$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CompanyActions.updateTeamMember),
      mergeMap((action) => this.companyService.updateTeamMember(action.employeeId, action.changes)
        .pipe(
          map(() => CompanyActions.updateTeamMemberSuccess({ employeeId: action.employeeId })),
          catchError((err) => {
            const payload = (err && err.error && err.error.error) || (err && err.message) || 'An error occurred';
            return of(CompanyActions.updateTeamMemberFail({ payload }))
          })
        )
      )
    );
  });

  removeTeamMember$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CompanyActions.removeTeamMember),
      mergeMap((action) => this.companyService.removeTeamMember(action.employeeId)
        .pipe(
          map(() => CompanyActions.removeTeamMemberSuccess({ employeeId: action.employeeId })),
          catchError((err) => {
            const payload = (err && err.error && err.error.error) || (err && err.message) || 'An error occurred';
            return of(CompanyActions.removeTeamMemberFail({ payload }))
          })
        )
      )
    );
  });

  suspendTeamMember$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CompanyActions.suspendTeamMember),
      mergeMap((action) => this.companyService.suspendTeamMember(action.employeeId)
        .pipe(
          map(() => CompanyActions.suspendTeamMemberSuccess({ employeeId: action.employeeId })),
          catchError((err) => {
            const payload = (err && err.error && err.error.error) || (err && err.message) || 'An error occurred';
            return of(CompanyActions.suspendTeamMemberFail({ payload }))
          })
        )
      )
    );
  });

  reactivateTeamMember$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CompanyActions.reactivateTeamMember),
      mergeMap((action) => this.companyService.reactivateTeamMember(action.employeeId)
        .pipe(
          map(() => CompanyActions.reactivateTeamMemberSuccess({ employeeId: action.employeeId })),
          catchError((err) => {
            const payload = (err && err.error && err.error.error) || (err && err.message) || 'An error occurred';
            return of(CompanyActions.reactivateTeamMemberFail({ payload }))
          })
        )
      )
    );
  });

  getPermissionCatalog$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CompanyActions.getPermissionCatalog),
      mergeMap(() => this.companyService.getPermissionCatalog()
        .pipe(
          map((res: any) => CompanyActions.getPermissionCatalogSuccess({ permissions: res.data })),
          catchError((err) => {
            const payload = (err && err.error && err.error.error) || (err && err.message) || 'An error occurred';
            return of(CompanyActions.getPermissionCatalogFail({ payload }))
          })
        )
      )
    );
  });

  createCustomRole$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CompanyActions.createCustomRole),
      mergeMap((action) => this.companyService.createCustomRole(action.request)
        .pipe(
          map((res: any) => CompanyActions.createCustomRoleSuccess({ role: res.data })),
          catchError((err) => {
            const payload = (err && err.error && err.error.error) || (err && err.message) || 'An error occurred';
            return of(CompanyActions.createCustomRoleFail({ payload }))
          })
        )
      )
    );
  });

  updateCustomRole$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CompanyActions.updateCustomRole),
      mergeMap((action) => this.companyService.updateCustomRole(action.roleId, action.changes)
        .pipe(
          map(() => CompanyActions.updateCustomRoleSuccess({ roleId: action.roleId })),
          catchError((err) => {
            const payload = (err && err.error && err.error.error) || (err && err.message) || 'An error occurred';
            return of(CompanyActions.updateCustomRoleFail({ payload }))
          })
        )
      )
    );
  });

  archiveCustomRole$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CompanyActions.archiveCustomRole),
      mergeMap((action) => this.companyService.archiveCustomRole(action.roleId)
        .pipe(
          map(() => CompanyActions.archiveCustomRoleSuccess({ roleId: action.roleId })),
          catchError((err) => {
            const payload = (err && err.error && err.error.error) || (err && err.message) || 'An error occurred';
            return of(CompanyActions.archiveCustomRoleFail({ payload }))
          })
        )
      )
    );
  });

  resendInvite$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CompanyActions.resendInvite),
      mergeMap((action) => this.companyService.resendInvite(action.invitationId)
        .pipe(
          map(() => CompanyActions.resendInviteSuccess({ invitationId: action.invitationId })),
          catchError((err) => {
            const payload = (err && err.error && err.error.error) || (err && err.message) || 'An error occurred';
            return of(CompanyActions.resendInviteFail({ payload }))
          })
        )
      )
    );
  });

  getAuditLogs$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CompanyActions.getAuditLogs),
      mergeMap(() => this.companyService.getAuditLogs()
        .pipe(
          map((res: any) => CompanyActions.getAuditLogsSuccess({ logs: res.data })),
          catchError((err) => {
            const payload = (err && err.error && err.error.error) || (err && err.message) || 'An error occurred';
            return of(CompanyActions.getAuditLogsFail({ payload }))
          })
        )
      )
    );
  });
}
