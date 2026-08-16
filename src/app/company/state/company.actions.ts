import {
  createAction,
  props
} from "@ngrx/store";
import * as Model from '../company.model';
import * as TeamModel from '../team-access.model';

enum AllCompanyActionTypes {
  GetAllCompany = '[company] - Get All Company',
  GetAllCompanySuccess = '[company] - Get All CompanySuccess',
  GetAllCompanyFail = '[company] - Get All Company Fail',

  GetCompany = '[company] - Get Company',
  GetCompanySuccess = '[company] - Get Company Success',
  GetCompanyFail = '[company] - Get Company Fail',

  GetCompanyUsers = '[company] - Get Company Users',
  GetCompanyUsersSuccess = '[company] - Get Company Users Success',
  GetCompanyUsersFail = '[company] - Get Company Users Fail',

  GetCompanySubscription = '[company] - Get Company Subscription',
  GetCompanySubscriptionSuccess = '[company] - Get Company Subscription Success',
  GetCompanySubscriptionFail = '[company] - Get Company Subscription Fail',

  CreateCompany = '[company] - Create Company',
  CreateCompanySuccess = '[company] - Create Company Success',
  CreateCompanyFail = '[company] - Create Company Fail',

  CreateInitialCompany = '[company] - Create Initial Company',
  CreateInitialCompanySuccess = '[company] - Create Initial Company Success',
  CreateInitialCompanyFail = '[company] - Create Initial Company Fail',

  UpdateCompany = '[company] - Update Company',
  UpdateCompanySuccess = '[company] - Update Company Success',
  UpdateCompanyFail = '[company] - Update Company Fail',

  CompanyDashboard = '[company] - Company Dashboard',
  CompanyDashboardSuccess = '[company] - Company Dashboard Success',
  CompanyDashboardFail = '[company] - Company Dashboard Fail',

  GetSetupList = '[company] - Get Setup List',
  GetSetupListSuccess = '[company] - Get Setup List Success',
  GetSetupListFail = '[company] - Get Setup List Fail',

  GetIndustryList = '[company] - Get Industry List',
  GetIndustryListSuccess = '[company] - Get Industry List Success',
  GetIndustryListFail = '[company] - Get Industry List Fail',

  ResetState = '[company] - Reset State',

  GetTeamRoles = '[company] - Get Team Roles',
  GetTeamRolesSuccess = '[company] - Get Team Roles Success',
  GetTeamRolesFail = '[company] - Get Team Roles Fail',

  GetPendingInvites = '[company] - Get Pending Invites',
  GetPendingInvitesSuccess = '[company] - Get Pending Invites Success',
  GetPendingInvitesFail = '[company] - Get Pending Invites Fail',

  InviteTeamMembers = '[company] - Invite Team Members',
  InviteTeamMembersSuccess = '[company] - Invite Team Members Success',
  InviteTeamMembersFail = '[company] - Invite Team Members Fail',

  RevokeInvite = '[company] - Revoke Invite',
  RevokeInviteSuccess = '[company] - Revoke Invite Success',
  RevokeInviteFail = '[company] - Revoke Invite Fail',

  UpdateTeamMember = '[company] - Update Team Member',
  UpdateTeamMemberSuccess = '[company] - Update Team Member Success',
  UpdateTeamMemberFail = '[company] - Update Team Member Fail',

  RemoveTeamMember = '[company] - Remove Team Member',
  RemoveTeamMemberSuccess = '[company] - Remove Team Member Success',
  RemoveTeamMemberFail = '[company] - Remove Team Member Fail',

  SuspendTeamMember = '[company] - Suspend Team Member',
  SuspendTeamMemberSuccess = '[company] - Suspend Team Member Success',
  SuspendTeamMemberFail = '[company] - Suspend Team Member Fail',

  ReactivateTeamMember = '[company] - Reactivate Team Member',
  ReactivateTeamMemberSuccess = '[company] - Reactivate Team Member Success',
  ReactivateTeamMemberFail = '[company] - Reactivate Team Member Fail',

  GetPermissionCatalog = '[company] - Get Permission Catalog',
  GetPermissionCatalogSuccess = '[company] - Get Permission Catalog Success',
  GetPermissionCatalogFail = '[company] - Get Permission Catalog Fail',

  CreateCustomRole = '[company] - Create Custom Role',
  CreateCustomRoleSuccess = '[company] - Create Custom Role Success',
  CreateCustomRoleFail = '[company] - Create Custom Role Fail',

  UpdateCustomRole = '[company] - Update Custom Role',
  UpdateCustomRoleSuccess = '[company] - Update Custom Role Success',
  UpdateCustomRoleFail = '[company] - Update Custom Role Fail',

  ArchiveCustomRole = '[company] - Archive Custom Role',
  ArchiveCustomRoleSuccess = '[company] - Archive Custom Role Success',
  ArchiveCustomRoleFail = '[company] - Archive Custom Role Fail',

  ResendInvite = '[company] - Resend Invite',
  ResendInviteSuccess = '[company] - Resend Invite Success',
  ResendInviteFail = '[company] - Resend Invite Fail',

  GetAuditLogs = '[company] - Get Audit Logs',
  GetAuditLogsSuccess = '[company] - Get Audit Logs Success',
  GetAuditLogsFail = '[company] - Get Audit Logs Fail',

}

export const resetState = createAction(
  AllCompanyActionTypes.ResetState,
);

export const getAllcompany = createAction(
  AllCompanyActionTypes.GetAllCompany,
);

export const getAllcompanySuccess = createAction(
  AllCompanyActionTypes.GetAllCompanySuccess,
  props<{ company: Model.Company[] }>()
);

export const getAllcompanyFail = createAction(
  AllCompanyActionTypes.GetAllCompanyFail,
  props<{ payload: any }>()
);

export const getCompanyUsers = createAction(
  AllCompanyActionTypes.GetCompanyUsers,
  props<{ companyId: string }>()
);

export const getCompanyUsersSuccess = createAction(
  AllCompanyActionTypes.GetCompanyUsersSuccess,
  props<{ users: Model.CompanyUser[] }>()
);

export const getCompanyUsersFail = createAction(
  AllCompanyActionTypes.GetCompanyUsersFail,
  props<{ payload: any }>()
);

export const getCompanySubscription = createAction(
  AllCompanyActionTypes.GetCompanySubscription,
  props<{ companyId: string }>()
);

export const getCompanySubscriptionSuccess = createAction(
  AllCompanyActionTypes.GetCompanySubscriptionSuccess,
  props<{ subscription: Model.CompanySubscriptions }>()
);

export const getCompanySubscriptionFail = createAction(
  AllCompanyActionTypes.GetCompanySubscriptionFail,
  props<{ payload: any }>()
);

export const getCompany = createAction(
  AllCompanyActionTypes.GetCompany,
  props<{ companyId: string }>()
);

export const getCompanySuccess = createAction(
  AllCompanyActionTypes.GetCompanySuccess,
  props<{ company: Model.Company }>()
);

export const getCompanyFail = createAction(
  AllCompanyActionTypes.GetCompanyFail,
  props<{ payload: any }>()
);

export const createCompany = createAction(
  AllCompanyActionTypes.CreateCompany,
  props<{ company: Model.Company }>()
);

export const createCompanySuccess = createAction(
  AllCompanyActionTypes.CreateCompanySuccess,
  props<{ company: Model.Company }>()
);

export const createCompanyFail = createAction(
  AllCompanyActionTypes.CreateCompanyFail,
  props<{ payload: any }>()
);

export const createInitialCompany = createAction(
  AllCompanyActionTypes.CreateInitialCompany,
  props<{ companyName: string, companyEmail: string }>()
);

export const createInitialCompanySuccess = createAction(
  AllCompanyActionTypes.CreateInitialCompanySuccess,
  props<{ company: Model.Company }>()
);

export const createInitialCompanyFail = createAction(
  AllCompanyActionTypes.CreateInitialCompanyFail,
  props<{ payload: any }>()
);

export const updateCompany = createAction(
  AllCompanyActionTypes.UpdateCompany,
  props<{ company: Model.Company }>()
);

export const updateCompanySuccess = createAction(
  AllCompanyActionTypes.UpdateCompanySuccess,
  props<{ company: Model.Company }>()
);

export const updateCompanyFail = createAction(
  AllCompanyActionTypes.UpdateCompanyFail,
  props<{ payload: any }>()
);

export const companyDashboard = createAction(
  AllCompanyActionTypes.CompanyDashboard
);

export const companyDashboardSuccess = createAction(
  AllCompanyActionTypes.CompanyDashboardSuccess,
  props<{ dashboard: Model.Dashboard }>()
);

export const companyDashboardFail = createAction(
  AllCompanyActionTypes.CompanyDashboardFail,
  props<{ payload: any }>()
);

export const getIndustryList = createAction(
  AllCompanyActionTypes.GetIndustryList
);

export const getIndustryListSuccess = createAction(
  AllCompanyActionTypes.GetIndustryListSuccess,
  props<{ industry: Model.Options[] }>()
);

export const getIndustryListFail = createAction(
  AllCompanyActionTypes.GetIndustryListFail,
  props<{ payload: any }>()
);

export const getSetupList = createAction(
  AllCompanyActionTypes.GetSetupList
);

export const getSetupListSuccess = createAction(
  AllCompanyActionTypes.GetSetupListSuccess,
  props<{ setup: Model.Options[] }>()
);

export const getSetupListFail = createAction(
  AllCompanyActionTypes.GetSetupListFail,
  props<{ payload: any }>()
);

export const getTeamRoles = createAction(
  AllCompanyActionTypes.GetTeamRoles,
);

export const getTeamRolesSuccess = createAction(
  AllCompanyActionTypes.GetTeamRolesSuccess,
  props<{ roles: TeamModel.TeamRole[] }>()
);

export const getTeamRolesFail = createAction(
  AllCompanyActionTypes.GetTeamRolesFail,
  props<{ payload: any }>()
);

export const getPendingInvites = createAction(
  AllCompanyActionTypes.GetPendingInvites,
);

export const getPendingInvitesSuccess = createAction(
  AllCompanyActionTypes.GetPendingInvitesSuccess,
  props<{ invites: TeamModel.TeamInvitation[] }>()
);

export const getPendingInvitesFail = createAction(
  AllCompanyActionTypes.GetPendingInvitesFail,
  props<{ payload: any }>()
);

export const inviteTeamMembers = createAction(
  AllCompanyActionTypes.InviteTeamMembers,
  props<{ invites: TeamModel.InviteMemberRequest[] }>()
);

export const inviteTeamMembersSuccess = createAction(
  AllCompanyActionTypes.InviteTeamMembersSuccess,
  props<{ companyId: string; invites: TeamModel.InviteResultItem[] }>()
);

export const inviteTeamMembersFail = createAction(
  AllCompanyActionTypes.InviteTeamMembersFail,
  props<{ payload: any }>()
);

export const revokeInvite = createAction(
  AllCompanyActionTypes.RevokeInvite,
  props<{ invitationId: string }>()
);

export const revokeInviteSuccess = createAction(
  AllCompanyActionTypes.RevokeInviteSuccess,
  props<{ invitationId: string }>()
);

export const revokeInviteFail = createAction(
  AllCompanyActionTypes.RevokeInviteFail,
  props<{ payload: any }>()
);

export const updateTeamMember = createAction(
  AllCompanyActionTypes.UpdateTeamMember,
  props<{ employeeId: string; changes: TeamModel.UpdateMemberRequest }>()
);

export const updateTeamMemberSuccess = createAction(
  AllCompanyActionTypes.UpdateTeamMemberSuccess,
  props<{ employeeId: string }>()
);

export const updateTeamMemberFail = createAction(
  AllCompanyActionTypes.UpdateTeamMemberFail,
  props<{ payload: any }>()
);

export const removeTeamMember = createAction(
  AllCompanyActionTypes.RemoveTeamMember,
  props<{ employeeId: string }>()
);

export const removeTeamMemberSuccess = createAction(
  AllCompanyActionTypes.RemoveTeamMemberSuccess,
  props<{ employeeId: string }>()
);

export const removeTeamMemberFail = createAction(
  AllCompanyActionTypes.RemoveTeamMemberFail,
  props<{ payload: any }>()
);

export const suspendTeamMember = createAction(
  AllCompanyActionTypes.SuspendTeamMember,
  props<{ employeeId: string }>()
);

export const suspendTeamMemberSuccess = createAction(
  AllCompanyActionTypes.SuspendTeamMemberSuccess,
  props<{ employeeId: string }>()
);

export const suspendTeamMemberFail = createAction(
  AllCompanyActionTypes.SuspendTeamMemberFail,
  props<{ payload: any }>()
);

export const reactivateTeamMember = createAction(
  AllCompanyActionTypes.ReactivateTeamMember,
  props<{ employeeId: string }>()
);

export const reactivateTeamMemberSuccess = createAction(
  AllCompanyActionTypes.ReactivateTeamMemberSuccess,
  props<{ employeeId: string }>()
);

export const reactivateTeamMemberFail = createAction(
  AllCompanyActionTypes.ReactivateTeamMemberFail,
  props<{ payload: any }>()
);

export const getPermissionCatalog = createAction(
  AllCompanyActionTypes.GetPermissionCatalog,
);

export const getPermissionCatalogSuccess = createAction(
  AllCompanyActionTypes.GetPermissionCatalogSuccess,
  props<{ permissions: TeamModel.PermissionDef[] }>()
);

export const getPermissionCatalogFail = createAction(
  AllCompanyActionTypes.GetPermissionCatalogFail,
  props<{ payload: any }>()
);

export const createCustomRole = createAction(
  AllCompanyActionTypes.CreateCustomRole,
  props<{ request: TeamModel.CreateCustomRoleRequest }>()
);

export const createCustomRoleSuccess = createAction(
  AllCompanyActionTypes.CreateCustomRoleSuccess,
  props<{ role: TeamModel.TeamRole }>()
);

export const createCustomRoleFail = createAction(
  AllCompanyActionTypes.CreateCustomRoleFail,
  props<{ payload: any }>()
);

export const updateCustomRole = createAction(
  AllCompanyActionTypes.UpdateCustomRole,
  props<{ roleId: string; changes: TeamModel.UpdateCustomRoleRequest }>()
);

export const updateCustomRoleSuccess = createAction(
  AllCompanyActionTypes.UpdateCustomRoleSuccess,
  props<{ roleId: string }>()
);

export const updateCustomRoleFail = createAction(
  AllCompanyActionTypes.UpdateCustomRoleFail,
  props<{ payload: any }>()
);

export const archiveCustomRole = createAction(
  AllCompanyActionTypes.ArchiveCustomRole,
  props<{ roleId: string }>()
);

export const archiveCustomRoleSuccess = createAction(
  AllCompanyActionTypes.ArchiveCustomRoleSuccess,
  props<{ roleId: string }>()
);

export const archiveCustomRoleFail = createAction(
  AllCompanyActionTypes.ArchiveCustomRoleFail,
  props<{ payload: any }>()
);

export const resendInvite = createAction(
  AllCompanyActionTypes.ResendInvite,
  props<{ invitationId: string }>()
);

export const resendInviteSuccess = createAction(
  AllCompanyActionTypes.ResendInviteSuccess,
  props<{ invitationId: string }>()
);

export const resendInviteFail = createAction(
  AllCompanyActionTypes.ResendInviteFail,
  props<{ payload: any }>()
);

export const getAuditLogs = createAction(
  AllCompanyActionTypes.GetAuditLogs,
);

export const getAuditLogsSuccess = createAction(
  AllCompanyActionTypes.GetAuditLogsSuccess,
  props<{ logs: TeamModel.AuditLogEntry[] }>()
);

export const getAuditLogsFail = createAction(
  AllCompanyActionTypes.GetAuditLogsFail,
  props<{ payload: any }>()
);
