import { Injectable } from '@angular/core';
import { environment } from "@environments/environment";
import { BaseService } from "@main/core/services/base.service";
import * as Model from "./application.model";

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {

  applicationUrl = `${environment.api_url}/application`;

  constructor(
    private baseService: BaseService
  ) { }

  submitApplication(application: Model.Application) {
    return this.baseService.post<Model.Application>(`${this.applicationUrl}/apply`, application);
  }

  // getPublishedApplication(companyId?: string) {
  //   const params = companyId ? `?id=${companyId}`: '';
  //   return this.baseService.get<Model.BasicJob[]>(`${this.applicationUrl}/published${params}`);
  // }

  // getShareableLink(applicationId: string) {
  //   return this.baseService.get<any>(`${this.applicationUrl}/sharelink?id=${applicationId}`);
  // }

}
