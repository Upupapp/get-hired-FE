import { Injectable } from '@angular/core';
import { BaseService } from '@app-core/services/base.service';
import { environment } from '@environments/environment';
import * as Model from "./interview.model";

@Injectable({
  providedIn: 'root'
})
export class InterviewService {

  interviewUrl = `${environment.api_url}/interview`;

  constructor(
    private baseService: BaseService
  ) { }

  getInterview(companyId: string) {
        return this.baseService.get<Model.GroupInterview[]>(`${this.interviewUrl}/getall?companyId=${companyId}`);
  }
}
