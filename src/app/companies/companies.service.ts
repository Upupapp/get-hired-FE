import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import { BaseService } from "@main/core/services/base.service";
import * as Model from "./companies.model";

@Injectable({
  providedIn: 'root'
})
export class CompaniesService {

  companyUrl = `${environment.api_url}/company`;

  constructor(
    private baseService: BaseService
  ) { }

  getAllFeaturedCompanies(){
    return this.baseService.get<Model.BasicInfo[]>(`${this.companyUrl}/featured`);
  }

  getCompanyById(companyId: string = ''){
    return this.baseService.get<Model.Company>(`${this.companyUrl}/details?id=${companyId}`);
  }

  getCompanyBySlug(slug: string) {
    return this.baseService.get<Model.Company>(`${this.companyUrl}/slug/${slug}`);
  }

  getPublicCompanies(page: number = 1) {
    return this.baseService.get<{ companies: Model.CompanyListItem[]; total: number; page: number; limit: number }>(
      `${environment.api_url}/public/companies?page=${page}`
    );
  }

  getPublicCompanyProfile(slug: string) {
    return this.baseService.get<Model.PublicCompanyProfile>(
      `${environment.api_url}/public/company/${encodeURIComponent(slug)}`
    );
  }

  getPublicCompanyJobs(slug: string) {
    return this.baseService.get<{ jobs: Model.PublicJob[]; total: number }>(
      `${environment.api_url}/public/company/${encodeURIComponent(slug)}/jobs`
    );
  }

  resolveCompanyIdToSlug(companyId: string) {
    return this.baseService.get<{ slug: string; companyId: string }>(
      `${environment.api_url}/public/company/id/${encodeURIComponent(companyId)}/resolve`
    );
  }

  getShareableLink(companyId: string) {
    return this.baseService.get<any>(`${this.companyUrl}/sharelink?id=${companyId}`);
  }

  // ─── Follow Company ────────────────────────────────────────────────────────

  getCompanyFollowState(slug: string) {
    return this.baseService.get<Model.PublicCompanyFollowState>(
      `${environment.api_url}/public/companies/${encodeURIComponent(slug)}/follow-state`
    );
  }

  followCompany(slug: string) {
    return this.baseService.post<{ following: boolean }>(
      `${environment.api_url}/public/companies/${encodeURIComponent(slug)}/follow`,
      {}
    );
  }

  unfollowCompany(slug: string) {
    return this.baseService.delete<{ following: boolean }>(
      `${environment.api_url}/public/companies/${encodeURIComponent(slug)}/follow`
    );
  }
}
