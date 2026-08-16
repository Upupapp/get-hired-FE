import { Injectable } from "@angular/core";
import * as Model from '../company.model';
import * as TeamModel from '../team-access.model';
import { State } from './company.reducer';
import { select, Store } from "@ngrx/store";
import * as CompanyAction from './company.actions';
import * as fromfeature from './company.selector';

@Injectable()
export class CompanyFacade {
    loading$ = this.store.pipe(select(fromfeature.loading));
    companyDetails$ = this.store.pipe(select(fromfeature.getCompanyDetails));
    companyList$ = this.store.pipe(select(fromfeature.getCompanyList));
    success$ = this.store.pipe(select(fromfeature.getSuccessMsg));
    dashboard$ = this.store.pipe(select(fromfeature.companyDashboard));
    users$ = this.store.pipe(select(fromfeature.getCompanyUsers));
    setup$ = this.store.pipe(select(fromfeature.getSetupList));
    industry$ = this.store.pipe(select(fromfeature.getIndustryList));
    subsRestrictions$ = this.store.pipe(select(fromfeature.getCompanySubscription));
    error$ = this.store.pipe(select(fromfeature.getError));
    teamRoles$ = this.store.pipe(select(fromfeature.getTeamRoles));
    pendingInvites$ = this.store.pipe(select(fromfeature.getPendingInvites));
    inviteResult$ = this.store.pipe(select(fromfeature.getInviteResult));
    teamActionSuccess$ = this.store.pipe(select(fromfeature.getTeamActionSuccess));
    teamActionError$ = this.store.pipe(select(fromfeature.getTeamActionError));
    permissionCatalog$ = this.store.pipe(select(fromfeature.getPermissionCatalog));
    auditLogs$ = this.store.pipe(select(fromfeature.getAuditLogs));

    constructor(
      private store: Store<State>,
      ) { }

    resetStateNotif() {
      this.store.dispatch(CompanyAction.resetState());
    }

    getAllCompany() {
      this.store.dispatch(CompanyAction.getAllcompany());
    }

    createInitialCompany(companyName: string, companyEmail: string) {
      this.store.dispatch(CompanyAction.createInitialCompany({ companyName, companyEmail }));
    }

    createCompany(company: Model.Company) {
      this.store.dispatch(CompanyAction.createCompany({ company }));
    }

    updateCompany(company: Model.Company) {
      this.store.dispatch(CompanyAction.updateCompany({ company }));
    }

    getCompany(companyId?: string) {
      this.store.dispatch(CompanyAction.getCompany({ companyId }));
    }

    getCompanyDashboard() {
      this.store.dispatch(CompanyAction.companyDashboard());
    }

    getCompanyUsers(companyId: string) {
      this.store.dispatch(CompanyAction.getCompanyUsers({ companyId }));
    }

    getCompanySubscription(companyId: string) {
      this.store.dispatch(CompanyAction.getCompanySubscription({ companyId }));
    }

    getIndustry() {
      this.store.dispatch(CompanyAction.getIndustryList());
    }

    getSetup() {
      this.store.dispatch(CompanyAction.getSetupList());
    }

    getTeamRoles() {
      this.store.dispatch(CompanyAction.getTeamRoles());
    }

    getPendingInvites() {
      this.store.dispatch(CompanyAction.getPendingInvites());
    }

    inviteTeamMembers(invites: TeamModel.InviteMemberRequest[]) {
      this.store.dispatch(CompanyAction.inviteTeamMembers({ invites }));
    }

    revokeInvite(invitationId: string) {
      this.store.dispatch(CompanyAction.revokeInvite({ invitationId }));
    }

    updateTeamMember(employeeId: string, changes: TeamModel.UpdateMemberRequest) {
      this.store.dispatch(CompanyAction.updateTeamMember({ employeeId, changes }));
    }

    removeTeamMember(employeeId: string) {
      this.store.dispatch(CompanyAction.removeTeamMember({ employeeId }));
    }

    suspendTeamMember(employeeId: string) {
      this.store.dispatch(CompanyAction.suspendTeamMember({ employeeId }));
    }

    reactivateTeamMember(employeeId: string) {
      this.store.dispatch(CompanyAction.reactivateTeamMember({ employeeId }));
    }

    getPermissionCatalog() {
      this.store.dispatch(CompanyAction.getPermissionCatalog());
    }

    createCustomRole(request: TeamModel.CreateCustomRoleRequest) {
      this.store.dispatch(CompanyAction.createCustomRole({ request }));
    }

    updateCustomRole(roleId: string, changes: TeamModel.UpdateCustomRoleRequest) {
      this.store.dispatch(CompanyAction.updateCustomRole({ roleId, changes }));
    }

    archiveCustomRole(roleId: string) {
      this.store.dispatch(CompanyAction.archiveCustomRole({ roleId }));
    }

    resendInvite(invitationId: string) {
      this.store.dispatch(CompanyAction.resendInvite({ invitationId }));
    }

    getAuditLogs() {
      this.store.dispatch(CompanyAction.getAuditLogs());
    }
}
