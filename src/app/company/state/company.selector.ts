import { createFeatureSelector, createSelector } from "@ngrx/store";
import { CompanyState } from './company.reducer';

const getCompanyInitState = createFeatureSelector<CompanyState >('company');

export const loading = createSelector (
  getCompanyInitState,
  state => state.loading
);

export const getSuccessMsg = createSelector (
  getCompanyInitState,
  state => state.succesMsg
);

export const getError = createSelector (
  getCompanyInitState,
  state => state.error
);

export const getCompanyList = createSelector (
  getCompanyInitState,
  state => state.list
);

export const getCompanyDetails = createSelector (
  getCompanyInitState,
  state => state.selected
);

export const companyDashboard = createSelector (
  getCompanyInitState,
  state => state.dashboard
);

export const getSetupList = createSelector(
  getCompanyInitState,
  state => state.setup
);

export const getIndustryList = createSelector(
  getCompanyInitState,
  state => state.industry
);

export const getCompanyUsers = createSelector(
  getCompanyInitState,
  state => state.users
);

export const getCompanySubscription = createSelector(
  getCompanyInitState,
  state => state.subs
);

export const getTeamRoles = createSelector(
  getCompanyInitState,
  state => state.teamRoles
);

export const getPendingInvites = createSelector(
  getCompanyInitState,
  state => state.pendingInvites
);

export const getInviteResult = createSelector(
  getCompanyInitState,
  state => state.inviteResult
);

export const getTeamActionSuccess = createSelector(
  getCompanyInitState,
  state => state.teamActionSuccess
);

export const getTeamActionError = createSelector(
  getCompanyInitState,
  state => state.teamActionError
);

export const getPermissionCatalog = createSelector(
  getCompanyInitState,
  state => state.permissionCatalog
);

export const getAuditLogs = createSelector(
  getCompanyInitState,
  state => state.auditLogs
);
