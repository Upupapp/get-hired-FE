import { Injectable } from '@angular/core';
import { BaseService } from '@main/core/services/base.service';
import { environment } from 'environments/environment';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApplicantJobsService {
  ApplicantJobsUrl = `${environment.api_url}/candidates`;
  optionUrl = `${environment.api_url}/options`;

  constructor(private baseService: BaseService) { }
  getApplicantJobs(data: any) {
    return this.baseService.get<any>(
      `${this.ApplicantJobsUrl}/appliedjobslist?candidateId=${data}`
    );
  }
}
