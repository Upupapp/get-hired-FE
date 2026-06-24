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

  /** Returns the applicant's own application snapshot + completeness (single). */
  getApplicationSnapshot(applicationId: string) {
    return this.baseService.get<any>(`${environment.api_url}/applicant/application/snapshot?applicationId=${encodeURIComponent(applicationId)}`);
  }

  /** Batch completeness snapshots for up to 50 applicationIds in a single request.
   *  Returns { snapshots: { [applicationId]: { hasSnapshot, completenessScore, ... } } }. */
  getApplicationSnapshots(applicationIds: string[]) {
    const ids = applicationIds.map(id => encodeURIComponent(id)).join(',');
    return this.baseService.get<any>(`${environment.api_url}/applicant/application/snapshots?applicationIds=${ids}`);
  }

  // getPublishedApplication(companyId?: string) {
  //   const params = companyId ? `?id=${companyId}`: '';
  //   return this.baseService.get<Model.BasicJob[]>(`${this.applicationUrl}/published${params}`);
  // }

  // getShareableLink(applicationId: string) {
  //   return this.baseService.get<any>(`${this.applicationUrl}/sharelink?id=${applicationId}`);
  // }

}
