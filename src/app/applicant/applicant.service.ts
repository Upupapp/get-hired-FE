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
  optionUrl = `${environment.api_url}/options`;

  constructor(private baseService: BaseService) { }

  getApplicant(userId: string) {
    return this.baseService.get<Model.Applicant>(
      `${this.applicantUrl}/profile?id=${userId}`
    );
  }

  getSetupList() {
    return this.baseService.get<Model.Options>(`${this.optionUrl}/setuplist`);
  }

  getTypeList() {
    return this.baseService.get<Model.Options>(`${this.optionUrl}/type`);
  }

  getLevelList(){
    return this.baseService.get<Model.Options>(`${this.optionUrl}/levels`);
  }
}
