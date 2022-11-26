import { Injectable } from '@angular/core';
import { environment } from "@environments/environment";
import { BaseService } from "@main/core/services/base.service";
import * as Model from "./jobs.model";

@Injectable({
  providedIn: 'root'
})
export class JobsService {

  jobUrl = `${environment.api_url}/job`;

  constructor(
    private baseService: BaseService
  ) { }

  getPublishedJobs(companyId?: string) {
    const params = companyId ? `?id=${companyId}`: '';
    return this.baseService.get<Model.BasicJob[]>(`${this.jobUrl}/published${params}`);
  }

  getShareableLink(jobId: string) {
    return this.baseService.get<any>(`${this.jobUrl}/sharelink?id=${jobId}`);
  }

}
