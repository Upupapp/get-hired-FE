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

  saveApplicantBasicProfile(basicProfile: Model.BasicProfileInfo) {
    if (basicProfile.applicantProfileId) {
      return this.baseService.put<Model.BasicProfileInfo>(`${this.applicantUrl}/updatebasicinfo`, basicProfile);
    } else {
      return this.baseService.post<Model.BasicProfileInfo>(`${this.applicantUrl}/createprofile`, basicProfile);
    }
  }

  saveVideoCV(video: Model.VideoCV, profileId: string) {
    const body = {
      video, applicantProfileId: profileId
    };

    return this.baseService.put<Model.VideoCV>(`${this.applicantUrl}/savevideocv`, body);
  }

  saveProfessionalSkills(skills: string[], profileId: string) {
    const body = {
      skills, applicantProfileId: profileId
    };

    return this.baseService.post<string[]>(`${this.applicantUrl}/skills`, body);
  }

  saveWorkExperience(workExp: Model.WorkExperience[], profileId: string) {
    const body = {
      workExperience: workExp, applicantProfileId: profileId
    };
    return this.baseService.post<Model.WorkExperience[]>(`${this.applicantUrl}/workexp`, body);
  }

  saveEducationalBackground(educBg: Model.EducationalBackground[], profileId: string) {
    const body = {
      educationalBackground: educBg, applicantProfileId: profileId
    };
    return this.baseService.post<Model.EducationalBackground[]>(`${this.applicantUrl}/educbg`, body);
  }

  saveCertifications(cert: Model.Certifications[], profileId: string) {
    const body = {
      certifications: cert, applicantProfileId: profileId
    };
    return this.baseService.post<Model.EducationalBackground[]>(`${this.applicantUrl}/cert`, body);
  }

  saveDocuments(docs: Model.Documents[], profileId: string) {
    const body = {
      documents: docs, applicantProfileId: profileId
    };
    return this.baseService.post<Model.Documents[]>(`${this.applicantUrl}/docs`, body);
  }

  // ******************

  saveApplicant(profile: Model.Applicant) {
    if (profile.applicantProfileId) {
      return this.baseService.put<Model.Applicant>(`${this.applicantUrl}/updateprofile`, profile);
    } else {
      return this.baseService.post<Model.Applicant>(`${this.applicantUrl}/createprofile`, profile);
    }
  }

  getDashboardDetails() {
    return this.baseService.get<any>(`${this.applicantUrl}/dashboard`);
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

  // SEC-01 FIX: removed uid query param (?id=userId). The backend now derives
  // the requester identity exclusively from the verified Firebase JWT
  // (Authorization: Bearer <token>), which the existing HTTP interceptor
  // attaches to every request automatically. Sending a uid query was the IDOR
  // vector — any caller could change the param and read another user's profile.
  userProfile() {
    return this.baseService.get<any>(`${this.applicantUrl}/userprofile`);
  }

  /** PROFILE -- server-computed profile completeness score, always for
   * the authenticated caller's own profile (uid derived server-side, no
   * params needed). This is the canonical scoring source MATCH's
   * employer-side signals also read from -- frontend consumers should
   * call this instead of reimplementing the scoring logic client-side. */
  getProfileCompleteness() {
    return this.baseService.get<any>(`${this.applicantUrl}/profile/completeness`);
  }
}
