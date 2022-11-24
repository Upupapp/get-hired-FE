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

  getUserCompany(){
    return this.baseService.get<Model.Company>(`${this.companyUrl}/usercompany`);
  }

  addUserToCompany(email: string, companyId){
    const newUser = {
      email, companyId
    }
    return this.baseService.post(`${this.companyUrl}/addCompanyUser`, newUser);
  }

  getCompanyUsers(companyId: string) {
    return this.baseService.get<Model.CompanyUser[]>(`${this.companyUrl}/getallcompanyuser?id=${companyId}`);
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
