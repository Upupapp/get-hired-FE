import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import { BaseService } from "@main/core/services/base.service";
import { of } from "rxjs";
import * as Model from "./company.model";

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
    return this.baseService.get<Model.CompanyUser[]>(`${this.companyUrl}/getallcompanyuser?id=${companyId}`);
  }

  // Team & Access: removes one member's access to the company. Only ever
  // deletes the company_employees membership row (BE-side, already
  // RBAC-gated behind "team.manage" and last-owner protected) -- never the
  // underlying user account.
  removeCompanyUser(userId: string, companyId: string) {
    return this.baseService.delete<any>(`${this.companyUrl}/removecompanyuser`, {
      body: { userId, companyId }
    });
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
