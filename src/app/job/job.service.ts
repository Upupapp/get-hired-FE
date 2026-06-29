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

  /**
   * P2 FIX: true job-level delete. Sends DELETE /job/delete with only the
   * jobId in the body — never sends companyId (the backend derives it from
   * the authenticated caller's JWT). Returns the caller's refreshed job list.
   * HttpClient.delete requires body via { body: ... } in the options object.
   */
  deleteJobPost(jobId: string) {
    return this.baseService.delete<Model.BasicList[]>(`${this.jobUrl}/delete`, { body: { jobId } });
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

  /** Application snapshot summary for the employer applicant detail panel.
   * Additive — never replaces existing applicant detail data. */
  getApplicantSnapshotSummary(applicationId: string) {
    return this.baseService.get<any>(`${environment.api_url}/job/applicant/snapshot-summary?applicationId=${encodeURIComponent(applicationId)}`);
  }

  updateApplicationStatus(applicationId: string, newStatusId: number) {
    return this.baseService.put<any>(`${environment.api_url}/application/status`, { applicationId, newStatusId });
  }

  // P2-01 FIX: removed dead ?id= param — BE now derives company from the
  // authenticated caller's JWT (getUserCompany(req.user.uid)) and ignores
  // any caller-supplied id. Sending it was harmless but misleading.
  getJobBasicList(_companyId?: string) {
    return this.baseService.get<Model.BasicList[]>(`${this.jobUrl}/basiclist`);
  }

  getJobById(jobId: string) {
    // SEC-02 FIX: uid query param removed. The auth interceptor sends the
    // Firebase token as Authorization Bearer when the user is logged in.
    // The backend derives viewerContext from the verified token only.
    return this.baseService.get<Model.Job[]>(`${this.jobUrl}/details?id=${jobId}`);
  }

  // P2-01 FIX: removed dead ?id= param — BE now derives company from JWT.
  getJobExpiredList(_companyId?: string) {
    return this.baseService.get<Model.BasicList[]>(`${this.jobUrl}/expiredlist`);
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

  getJobActionSummary(jobId: string) {
    return this.baseService.get<any>(`${this.jobUrl}/action-summary?jobId=${encodeURIComponent(jobId)}`);
  }
}
