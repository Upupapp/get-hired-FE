import { Injectable } from '@angular/core';
import { environment } from "@environments/environment";
import { BaseService } from "@main/core/services/base.service";
import * as Model from "./job.model";

@Injectable({
  providedIn: 'root'
})
export class JobService {

  jobUrl = `${environment.api_url}/job`;

  constructor(
    private baseService: BaseService
  ) { }

  getIndustryList() {
    return this.baseService.get<Model.Options>(`${this.jobUrl}/industries`);
  }

  getBadgeList() {
    return this.baseService.get<Model.Options>(`${this.jobUrl}/badges`);
  }

  getJobRoleList(){
    return this.baseService.get<Model.Options>(`${this.jobUrl}/rolelist`);
  }

  getSetupList() {
    return this.baseService.get<Model.Options>(`${this.jobUrl}/setuplist`);
  }

  getTypeList() {
    return this.baseService.get<Model.Options>(`${this.jobUrl}/type`);
  }

  getLevelList(){
    return this.baseService.get<Model.Options>(`${this.jobUrl}/levels`);
  }

  getCategoryList(){
    return this.baseService.get<Model.Options>(`${this.jobUrl}/categories`);
  }
}
