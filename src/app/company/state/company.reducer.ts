import * as AppState from '@main/app.state';
import { createReducer, on } from '@ngrx/store';
import * as Model from '../company.model';
import * as TeamModel from '../team-access.model';
import * as CompanyActions from './company.actions';

export interface State extends AppState.State {
  company: CompanyState;
}

export interface CompanyState {
  selected: Model.Company;
  list: Model.Company[];
  error: any;
  succesMsg: string;
  loading: boolean;
  dashboard: Model.Dashboard;
  setup: Model.Options[];
  industry: Model.Options[];
  users: Model.CompanyUser[];
  subs: Model.CompanySubscriptions;
  teamRoles: TeamModel.TeamRole[];
  pendingInvites: TeamModel.TeamInvitation[];
  inviteResult: { companyId: string; invites: TeamModel.InviteResultItem[] };
  teamActionSuccess: string;
  teamActionError: any;
  permissionCatalog: TeamModel.PermissionDef[];
  auditLogs: TeamModel.AuditLogEntry[];
}

const initialState: CompanyState = {
  selected: null,
  list: [],
  succesMsg: '',
  error: null,
  loading: false,
  dashboard: null,
  setup: [],
  industry: [],
  users: [],
  subs: null,
  teamRoles: [],
  pendingInvites: [],
  inviteResult: null,
  teamActionSuccess: null,
  teamActionError: null,
  permissionCatalog: [],
  auditLogs: [],
};

export const companyReducer = createReducer<CompanyState>(
  initialState,
  on(CompanyActions.resetState, (state): CompanyState => {
    return {
      ...state,
      succesMsg: '',
      error: null,
      loading: false
    };
  }),
  on(CompanyActions.getAllcompany, (state): CompanyState => {
    return {
      ...state,
      loading: true
    };
  }),
  on(CompanyActions.getAllcompanySuccess, (state, action): CompanyState => {
    return {
      ...state,
      loading: false,
      list: action.company,
      error: null
    };
  }),
  on(CompanyActions.getAllcompanyFail, (state, action): CompanyState => {
    return {
      ...state,
      loading: false,
      error: action.payload
    };
  }),
  on(CompanyActions.createCompany, (state): CompanyState => {
    return {
      ...state,
      loading: true,
      error: null,
      succesMsg: null
    };
  }),
  on(CompanyActions.createCompanySuccess, (state, action): CompanyState => {
    return {
      ...state,
      loading: false,
      succesMsg: 'created',
      selected: action.company
    };
  }),
  on(CompanyActions.createCompanyFail, (state, action): CompanyState => {
    return {
      ...state,
      loading: false,
      error: action.payload
    };
  }),
  on(CompanyActions.createInitialCompany, (state): CompanyState => {
    return {
      ...state,
      loading: true,
      error: null,
      succesMsg: null
    };
  }),
  on(CompanyActions.createInitialCompanySuccess, (state, action): CompanyState => {
    return {
      ...state,
      loading: false,
      succesMsg: action.company.companyId,
      selected: action.company
    };
  }),
  on(CompanyActions.createInitialCompanyFail, (state, action): CompanyState => {
    return {
      ...state,
      loading: false,
      error: action.payload
    };
  }),
  on(CompanyActions.getCompanyUsers, (state): CompanyState => {
    return {
      ...state,
      loading: true,
      error: null,
      succesMsg: null
    };
  }),
  on(CompanyActions.getCompanyUsersSuccess, (state, action): CompanyState => {
    return {
      ...state,
      loading: false,
      users: action.users
    };
  }),
  on(CompanyActions.getCompanyUsersFail, (state, action): CompanyState => {
    return {
      ...state,
      loading: false,
      error: action.payload
    };
  }),
  on(CompanyActions.getCompanySubscription, (state): CompanyState => {
    return {
      ...state,
      loading: true,
      error: null,
      succesMsg: null
    };
  }),
  on(CompanyActions.getCompanySubscriptionSuccess, (state, action): CompanyState => {
    return {
      ...state,
      loading: false,
      subs: action.subscription
    };
  }),
  on(CompanyActions.getCompanySubscriptionFail, (state, action): CompanyState => {
    return {
      ...state,
      loading: false,
      error: action.payload
    };
  }),
  on(CompanyActions.getCompany, (state): CompanyState => {
    return {
      ...state,
      loading: true,
      error: null,
      succesMsg: null
    };
  }),
  on(CompanyActions.getCompanySuccess, (state, action): CompanyState => {
    return {
      ...state,
      loading: false,
      selected: action.company
    };
  }),
  on(CompanyActions.getCompanyFail, (state, action): CompanyState => {
    return {
      ...state,
      loading: false,
      error: action.payload
    };
  }),
  on(CompanyActions.updateCompany, (state): CompanyState => {
    return {
      ...state,
      loading: true,
      error: null,
      succesMsg: null
    };
  }),
  on(CompanyActions.updateCompanySuccess, (state, action): CompanyState => {
    const updatedDashboard = state.dashboard ? {
      ...state.dashboard,
      company: state.dashboard.company ? {
        ...state.dashboard.company,
        companyLogoUrl: action.company.companyLogoUrl,
        companyName: action.company.companyName,
        companyDetails: action.company.companyDetails,
        companyCity: action.company.companyCity,
        industryId: action.company.industryId,
        numberOfEmployee: action.company.numberOfEmployee,
      } : state.dashboard.company
    } : state.dashboard;
    return {
      ...state,
      loading: false,
      succesMsg: 'updated',
      selected: action.company,
      dashboard: updatedDashboard
    };
  }),
  on(CompanyActions.updateCompanyFail, (state, action): CompanyState => {
    return {
      ...state,
      loading: false,
      error: action.payload
    };
  }),
  on(CompanyActions.companyDashboard, (state): CompanyState => {
    return {
      ...state,
      loading: true,
      error: null,
      succesMsg: null
    };
  }),
  on(CompanyActions.companyDashboardSuccess, (state, action): CompanyState => {
    return {
      ...state,
      loading: false,
      dashboard: action.dashboard
    };
  }),
  on(CompanyActions.companyDashboardFail, (state, action): CompanyState => {
    return {
      ...state,
      loading: false,
      error: action.payload
    };
  }),
  on(CompanyActions.getIndustryList, (state): CompanyState => {
    return {
      ...state,
      loading: true
    };
  }),
  on(CompanyActions.getIndustryListSuccess, (state, action): CompanyState => {
    return {
      ...state,
      loading: false,
      industry: action.industry,
      error: null,
    };
  }),
  on(CompanyActions.getIndustryListFail, (state, action): CompanyState => {
    return {
      ...state,
      loading: false,
      error: action.payload
    };
  }),
  on(CompanyActions.getSetupList, (state): CompanyState => {
    return {
      ...state,
      loading: true
    };
  }),
  on(CompanyActions.getSetupListSuccess, (state, action): CompanyState => {
    return {
      ...state,
      loading: false,
      setup: action.setup,
      error: null,
    };
  }),
  on(CompanyActions.getSetupListFail, (state, action): CompanyState => {
    return {
      ...state,
      loading: false,
      error: action.payload
    };
  }),
  on(CompanyActions.getTeamRolesSuccess, (state, action): CompanyState => {
    return {
      ...state,
      teamRoles: action.roles
    };
  }),
  on(CompanyActions.getTeamRolesFail, (state, action): CompanyState => {
    return {
      ...state,
      teamActionError: action.payload
    };
  }),
  on(CompanyActions.getPendingInvitesSuccess, (state, action): CompanyState => {
    return {
      ...state,
      pendingInvites: action.invites
    };
  }),
  on(CompanyActions.getPendingInvitesFail, (state, action): CompanyState => {
    return {
      ...state,
      teamActionError: action.payload
    };
  }),
  on(CompanyActions.inviteTeamMembers, (state): CompanyState => {
    return {
      ...state,
      loading: true,
      teamActionError: null,
      inviteResult: null,
    };
  }),
  on(CompanyActions.inviteTeamMembersSuccess, (state, action): CompanyState => {
    return {
      ...state,
      loading: false,
      inviteResult: { companyId: action.companyId, invites: action.invites },
    };
  }),
  on(CompanyActions.inviteTeamMembersFail, (state, action): CompanyState => {
    return {
      ...state,
      loading: false,
      teamActionError: action.payload
    };
  }),
  on(CompanyActions.revokeInviteSuccess, (state, action): CompanyState => {
    return {
      ...state,
      pendingInvites: state.pendingInvites.filter(i => i.invitationId !== action.invitationId),
      teamActionSuccess: 'invite_revoked',
    };
  }),
  on(CompanyActions.revokeInviteFail, (state, action): CompanyState => {
    return {
      ...state,
      teamActionError: action.payload
    };
  }),
  on(CompanyActions.updateTeamMember, (state): CompanyState => {
    return {
      ...state,
      loading: true,
      teamActionError: null,
      teamActionSuccess: null,
    };
  }),
  on(CompanyActions.updateTeamMemberSuccess, (state): CompanyState => {
    return {
      ...state,
      loading: false,
      teamActionSuccess: 'member_updated',
    };
  }),
  on(CompanyActions.updateTeamMemberFail, (state, action): CompanyState => {
    return {
      ...state,
      loading: false,
      teamActionError: action.payload
    };
  }),
  on(CompanyActions.removeTeamMember, (state): CompanyState => {
    return {
      ...state,
      loading: true,
      teamActionError: null,
    };
  }),
  on(CompanyActions.removeTeamMemberSuccess, (state, action): CompanyState => {
    return {
      ...state,
      loading: false,
      users: state.users.filter(u => u.employeeId !== action.employeeId),
      teamActionSuccess: 'member_removed',
    };
  }),
  on(CompanyActions.removeTeamMemberFail, (state, action): CompanyState => {
    return {
      ...state,
      loading: false,
      teamActionError: action.payload
    };
  }),
  on(CompanyActions.suspendTeamMember, (state): CompanyState => {
    return { ...state, loading: true, teamActionError: null };
  }),
  on(CompanyActions.suspendTeamMemberSuccess, (state, action): CompanyState => {
    return {
      ...state,
      loading: false,
      users: state.users.map(u => u.employeeId === action.employeeId ? { ...u, status: 'suspended' } : u),
      teamActionSuccess: 'member_suspended',
    };
  }),
  on(CompanyActions.suspendTeamMemberFail, (state, action): CompanyState => {
    return { ...state, loading: false, teamActionError: action.payload };
  }),
  on(CompanyActions.reactivateTeamMember, (state): CompanyState => {
    return { ...state, loading: true, teamActionError: null };
  }),
  on(CompanyActions.reactivateTeamMemberSuccess, (state, action): CompanyState => {
    return {
      ...state,
      loading: false,
      users: state.users.map(u => u.employeeId === action.employeeId ? { ...u, status: 'active' } : u),
      teamActionSuccess: 'member_reactivated',
    };
  }),
  on(CompanyActions.reactivateTeamMemberFail, (state, action): CompanyState => {
    return { ...state, loading: false, teamActionError: action.payload };
  }),
  on(CompanyActions.getPermissionCatalogSuccess, (state, action): CompanyState => {
    return { ...state, permissionCatalog: action.permissions };
  }),
  on(CompanyActions.getPermissionCatalogFail, (state, action): CompanyState => {
    return { ...state, teamActionError: action.payload };
  }),
  on(CompanyActions.createCustomRole, (state): CompanyState => {
    return { ...state, loading: true, teamActionError: null, teamActionSuccess: null };
  }),
  on(CompanyActions.createCustomRoleSuccess, (state, action): CompanyState => {
    return { ...state, loading: false, teamRoles: [...state.teamRoles, action.role], teamActionSuccess: 'custom_role_created' };
  }),
  on(CompanyActions.createCustomRoleFail, (state, action): CompanyState => {
    return { ...state, loading: false, teamActionError: action.payload };
  }),
  on(CompanyActions.updateCustomRole, (state): CompanyState => {
    return { ...state, loading: true, teamActionError: null, teamActionSuccess: null };
  }),
  on(CompanyActions.updateCustomRoleSuccess, (state): CompanyState => {
    return { ...state, loading: false, teamActionSuccess: 'custom_role_updated' };
  }),
  on(CompanyActions.updateCustomRoleFail, (state, action): CompanyState => {
    return { ...state, loading: false, teamActionError: action.payload };
  }),
  on(CompanyActions.archiveCustomRoleSuccess, (state, action): CompanyState => {
    return {
      ...state,
      teamRoles: state.teamRoles.filter(r => r.roleId !== action.roleId),
      teamActionSuccess: 'custom_role_archived',
    };
  }),
  on(CompanyActions.archiveCustomRoleFail, (state, action): CompanyState => {
    return { ...state, teamActionError: action.payload };
  }),
  on(CompanyActions.resendInviteSuccess, (state): CompanyState => {
    return { ...state, teamActionSuccess: 'invite_resent' };
  }),
  on(CompanyActions.resendInviteFail, (state, action): CompanyState => {
    return { ...state, teamActionError: action.payload };
  }),
  on(CompanyActions.getAuditLogsSuccess, (state, action): CompanyState => {
    return { ...state, auditLogs: action.logs };
  }),
  on(CompanyActions.getAuditLogsFail, (state, action): CompanyState => {
    return { ...state, teamActionError: action.payload };
  }),
);
