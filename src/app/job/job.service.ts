import { Injectable } from '@angular/core';
import { environment } from "@environments/environment";
import { BaseService } from "@main/core/services/base.service";
import * as Model from "./job.model";
import * as InterviewModel from '@main/interview/interview.model';

@Injectable({
  providedIn: 'root'
})
export class JobService {

  jobUrl = `${environment.api_url}/job`;
  optionUrl = `${environment.api_url}/options`;

  constructor(
    private baseService: BaseService
  ) { }

  changeJobStatus(status, jobId) {
    return this.baseService.put<Model.Job>(`${this.jobUrl}/changestatus`, { status, jobId });
  }

  checkCompanySubscription(companyId: string) {
    return this.baseService.get<any>(`${this.jobUrl}/getsubscriptionrestrictions?companyId=${companyId}`);
  }

  saveJob(job: Model.Job) {
    if (job.jobId && job.jobId != '') {
      // update
      return this.baseService.put<Model.Job>(`${this.jobUrl}/updatejobs`, job);
    } else {
      // create
      return this.baseService.post<Model.Job>(`${this.jobUrl}/create`, job);
    }
  }

  updateJobInterviewQuestions(interviewQuestion: InterviewModel.InterviewQuestion) {
    return this.baseService.put<InterviewModel.InterviewQuestion>(`${this.jobUrl}/updatejobinterview`, interviewQuestion);
  }

  deleteJobInterviewQuestions(questionId: string, jobId: string) {
    return this.baseService.delete<string>(`${this.jobUrl}/deleteinterviewquestion?questionId=${questionId}&jobId=${jobId}`);
  }

  getJobApplicantDetails(jobId: string, userId: string) {
    return this.baseService.get<any>(`${this.jobUrl}/applicantdetails?jobId=${jobId}&id=${userId}`);
  }

  getJobApplicantsByJobId(jobId: string) {
    return this.baseService.get<Model.JobApplicants[]>(`${this.jobUrl}/applicants?id=${jobId}`);
  }

  /** Employer Portal v3 -- MATCH v5's Employer Applicant Fit Signals.
   * Separate, additive call alongside getJobApplicantsByJobId -- never
   * replaces it, so this endpoint failing/being slow can't break the
   * existing applicant list. */
  getJobApplicantSignals(jobId: string) {
    return this.baseService.get<any>(`${this.jobUrl}/applicants/signals?id=${jobId}`);
  }

  getJobBasicList(companyId: string) {
    return this.baseService.get<Model.BasicList[]>(`${this.jobUrl}/basiclist?id=${companyId}`);
  }

  getJobById(jobId: string) {
    const user = localStorage.getItem('user');
    const uid = user ? JSON.parse(user)._id : null;

    return this.baseService.get<Model.Job[]>(`${this.jobUrl}/details?id=${jobId}&uid=${uid}`);
  }

  getJobExpiredList(companyId: string) {
    return this.baseService.get<Model.BasicList[]>(`${this.jobUrl}/expiredlist?id=${companyId}`);
  }

  getIndustryList() {
    return this.baseService.get<Model.Options>(`${this.jobUrl}/industries`);
  }

  getBadgeList() {
    return this.baseService.get<Model.Options>(`${this.jobUrl}/badges`);
  }

  getJobRoleList() {
    return this.baseService.get<Model.Options>(`${this.jobUrl}/rolelist`);
  }

  getSetupList() {
    return this.baseService.get<Model.Options>(`${this.optionUrl}/setuplist`);
  }

  getTypeList() {
    return this.baseService.get<Model.Options>(`${this.optionUrl}/type`);
  }

  getLevelList() {
    return this.baseService.get<Model.Options>(`${this.optionUrl}/levels`);
  }

  getCategoryList() {
    return this.baseService.get<Model.Options>(`${this.jobUrl}/categories`);
  }
}
