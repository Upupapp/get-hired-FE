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

}
