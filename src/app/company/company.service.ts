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

  constructor(
    private baseService: BaseService
  ) { }

  createCompany(company: Model.Company){
    return this.baseService.post<Model.Company>(`${this.companyUrl}/createcompany`, company);
  }

  updateCompany(company: Model.Company){
    return this.baseService.put<Model.Company>(`${this.companyUrl}/update`, company);
  }

  getCompanyById(companyId: string = ''){
    return this.baseService.get<Model.Company>(`${this.companyUrl}/details?id=${companyId}`);
  }

  getDashboardDetails() {
    return this.baseService.get<Model.Dashboard>(`${this.companyUrl}/dashboard`);
  }

  getSetupList() {
    return this.baseService.get<Model.Options>(`${this.companyUrl}/setuplist`);
  }

  getIndustryList() {
    return this.baseService.get<Model.Options>(`${this.companyUrl}/industries`);
  }

}
