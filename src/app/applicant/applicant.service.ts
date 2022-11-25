import { Injectable } from '@angular/core';
import { BaseService } from '@main/core/services/base.service';
import { environment } from 'environments/environment';
import { of } from 'rxjs';
import * as Model from '../applicant/applicant.model';

@Injectable({
  providedIn: 'root',
})
export class ApplicantService {
  applicantUrl = `${environment.api_url}/applicant`;

  constructor(private baseService: BaseService) { }

  getApplicant(userId: string) {
    return this.baseService.get<Model.Applicant>(
      `${this.applicantUrl}/profile?id=${userId}`
    );
  }
}
