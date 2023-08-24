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

  getInterviewTemplates(companyId: string) {
    return this.baseService.get<Model.InterviewQuestionTemplate[]>(`${this.interviewUrl}/getalltemplates?companyId=${companyId}`);
  }

  getInterviewRecipient(companyId: string) {
    return this.baseService.get<Model.InterviewRecipients>(`${this.interviewUrl}/getallrecipients?companyId=${companyId}`);
  }

  getInterviewTemplateQuestions(templateId: string) {
    return this.baseService.get<Model.InterviewQuestion[]>(`${this.interviewUrl}/gettemplatequestions?templateId=${templateId}`);
  }

  saveGroupInterview(interview: Model.GroupInterview) {
    return this.baseService.post<Model.GroupInterview>(`${this.interviewUrl}/savegroupinterview`, interview);
  }
}
