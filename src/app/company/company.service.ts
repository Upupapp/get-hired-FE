import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import { BaseService } from "@main/core/services/base.service";
import { of } from "rxjs";
import * as Model from "./company.model";
import * as TeamModel from "./team-access.model";

@Injectable({
  providedIn: 'root'
})
export class CompanyService {

  companyUrl = `${environment.api_url}/company`;
  optionUrl = `${environment.api_url}/options`;

  constructor(
    private baseService: BaseService
  ) { }

  checkCompanySubscription(companyId) {
    return this.baseService.get<any>(`${this.companyUrl}/getsubscriptionrestrictions?companyId=${companyId}`);
  }

  createInitialCompany(companyName: string, companyEmail: string) {
    return this.baseService.post<Model.Company>(`${this.companyUrl}/createinitial`, {
      companyName, companyEmail
    });
  }

  createCompany(company: Model.Company) {
    return this.baseService.post<Model.Company>(`${this.companyUrl}/createcompany`, company);
  }

  updateCompany(company: Model.Company) {
    return this.baseService.put<Model.Company>(`${this.companyUrl}/update`, company);
  }

  getUserCompany() {
    return this.baseService.get<Model.Company>(`${this.companyUrl}/usercompany`);
  }

  addUserToCompany(email: string, companyId) {
    const newUser = {
      email, companyId
    }
    return this.baseService.post(`${this.companyUrl}/addCompanyUser`, newUser);
  }

  getCompanyUsers(companyId: string) {
    // Server derives company from the JWT -- the companyId param is unused
    // by the backend (kept in the call signature so existing dispatchers
    // don't need to change), replaced with the new job-scoped-RBAC-aware
    // Team & Access endpoint.
    return this.baseService.get<Model.CompanyUser[]>(`${this.companyUrl}/team/members`);
  }

  getTeamRoles(includeArchived = false) {
    return this.baseService.get<TeamModel.TeamRole[]>(`${this.companyUrl}/team/roles${includeArchived ? '?includeArchived=true' : ''}`);
  }

  getPermissionCatalog() {
    return this.baseService.get<TeamModel.PermissionDef[]>(`${this.companyUrl}/team/permissions`);
  }

  createCustomRole(request: TeamModel.CreateCustomRoleRequest) {
    return this.baseService.post<TeamModel.TeamRole>(`${this.companyUrl}/team/roles`, request);
  }

  updateCustomRole(roleId: string, changes: TeamModel.UpdateCustomRoleRequest) {
    return this.baseService.put(`${this.companyUrl}/team/roles/${roleId}`, changes);
  }

  archiveCustomRole(roleId: string) {
    return this.baseService.delete(`${this.companyUrl}/team/roles/${roleId}`);
  }

  resendInvite(invitationId: string) {
    return this.baseService.post(`${this.companyUrl}/team/invite/${invitationId}/resend`, {});
  }

  getAuditLogs(limit = 100) {
    return this.baseService.get<TeamModel.AuditLogEntry[]>(`${this.companyUrl}/team/audit-logs?limit=${limit}`);
  }

  getPendingInvites() {
    return this.baseService.get<TeamModel.TeamInvitation[]>(`${this.companyUrl}/team/invites`);
  }

  inviteTeamMembers(invites: TeamModel.InviteMemberRequest[]) {
    return this.baseService.post<{ companyId: string; invites: TeamModel.InviteResultItem[] }>(
      `${this.companyUrl}/team/invite`, { invites }
    );
  }

  revokeInvite(invitationId: string) {
    return this.baseService.delete(`${this.companyUrl}/team/invite/${invitationId}`);
  }

  updateTeamMember(employeeId: string, changes: TeamModel.UpdateMemberRequest) {
    return this.baseService.put(`${this.companyUrl}/team/members/${employeeId}`, changes);
  }

  removeTeamMember(employeeId: string) {
    return this.baseService.delete(`${this.companyUrl}/team/members/${employeeId}`);
  }

  suspendTeamMember(employeeId: string) {
    return this.baseService.post(`${this.companyUrl}/team/members/${employeeId}/suspend`, {});
  }

  reactivateTeamMember(employeeId: string) {
    return this.baseService.post(`${this.companyUrl}/team/members/${employeeId}/reactivate`, {});
  }

  previewInvite(token: string) {
    return this.baseService.get<{ companyName: string; companyLogoUrl: string; roleName: string }>(
      `${this.companyUrl}/team/invite/${token}/preview`
    );
  }

  acceptInvite(token: string, payload: { firstName?: string; lastName?: string }) {
    return this.baseService.post<{ companyId: string; companyName: string; resetLink?: string; redirectTo: string }>(
      `${this.companyUrl}/team/invite/${token}/accept`, payload
    );
  }

  // Reuses the existing, already job-scoped-on-the-server job list endpoint
  // (GET /job/basiclist) -- no new backend route needed for the job-picker.
  getAssignableJobs() {
    return this.baseService.get<TeamModel.AssignableJob[]>(`${environment.api_url}/job/basiclist`);
  }

  getDashboardDetails() {
    return this.baseService.get<Model.Dashboard>(`${this.companyUrl}/dashboard`);
  }

  /** GETHIRED_EMPLOYER_DASHBOARD_WORLD_CLASS_TECHY_REDESIGN_V2 -- real
   * applicant-stage counts + a "needs review" shortlist, scoped to the
   * caller's own company server-side. Fetched independently from
   * getDashboardDetails() so one failing call doesn't blank both widgets. */
  getDashboardPipelineOverview() {
    return this.baseService.get<any>(`${this.companyUrl}/dashboard/pipeline-overview`);
  }

  getDashboardAnalytics(range: '7d' | '30d' | '90d' = '30d') {
    return this.baseService.get<any>(`${environment.api_url}/recruiter/dashboard/analytics?range=${range}`);
  }

  getSetupList() {
    return this.baseService.get<Model.Options>(`${this.optionUrl}/setuplist`);
  }

  getIndustryList() {
    return this.baseService.get<Model.Options>(`${this.companyUrl}/industries`);
  }

}
