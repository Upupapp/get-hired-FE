import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import { BaseService } from "@main/core/services/base.service";
import { of } from "rxjs";
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

  getAllCompany() {

  }

}
