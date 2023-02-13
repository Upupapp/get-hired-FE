import { Injectable } from '@angular/core';
import * as Model from '../applicant.model';
import { State } from './applicant.reducer';
import { select, Store } from '@ngrx/store';
import * as ApplicantAction from './applicant.actions';
import * as fromfeature from './applicant.selector';
import * as InterviewModel from '@main/interview/interview.model';

@Injectable()
export class ApplicantFacade {
  loading$ = this.store.pipe(select(fromfeature.loading));
  applicantDetails$ = this.store.pipe(select(fromfeature.getApplicantById));
  user$ = this.store.pipe(select(fromfeature.getUser));
  // applicantList$ = this.store.pipe(select(fromfeature.getApplicantList));
  success$ = this.store.pipe(select(fromfeature.success));
  // industry$ = this.store.pipe(select(fromfeature.getIndustryList));
  // badge$ = this.store.pipe(select(fromfeature.getBadgeList));
  // applicantRole$ = this.store.pipe(select(fromfeature.getApplicantRoleList));
  setup$ = this.store.pipe(select(fromfeature.getSetupList));
  typeList$ = this.store.pipe(select(fromfeature.getTypeList));
  level$ = this.store.pipe(select(fromfeature.getLevelList));
  // category$ = this.store.pipe(select(fromfeature.getCategoryList));
  dashboard$ = this.store.pipe(select(fromfeature.applicantDashboard));

  initial$ = this.store.pipe(select(fromfeature.getInitialDetails));
  // info$ = this.store.pipe(select(fromfeature.getApplicantInfo));
  docu$ = this.store.pipe(select(fromfeature.getProfileDocs));
  // getApplicantById$ = this.store.pipe(select(fromfeature.getApplicantById));
  // getApplicantLoading$ = this.store.pipe(select(fromfeature.applicantLoading));
  error$: any;
  // applicantTemp$ = this.store.pipe(select(fromfeature.applicantTemp));

  getBasicInfo$ = this.store.pipe(select(fromfeature.getBasicInfo));
  additionalInfo$ = this.store.pipe(select(fromfeature.getAdditionalInfo));
  documents$ = this.store.pipe(select(fromfeature.getDocs));
  videoCV$ = this.store.pipe(select(fromfeature.getVideoCV));

  constructor(private store: Store<State>) {}

  saveVideo(video:Model.VideoCV, profileId: string) {
    this.store.dispatch(ApplicantAction.saveVideoCV({ video, profileId }));
  }

  saveDocs(docs: Model.Documents[], profileId: string) {
    this.store.dispatch(ApplicantAction.saveDocuments({ docs, profileId }));
  }

  saveCert(certs: Model.Certifications[], profileId: string) {
    this.store.dispatch(ApplicantAction.saveCertifications({ certs, profileId }));
  }

  saveEducBg(educBg: Model.EducationalBackground[], profileId: string) {
    this.store.dispatch(ApplicantAction.saveEducationalBackground({ educBg, profileId }));
  }

  saveWorkExperience(workExperience: Model.WorkExperience[], profileId: string) {
    this.store.dispatch(ApplicantAction.saveWorkExperience({ workExperience, profileId }));
  }

  saveSkills(skills: string[], profileId: string) {
    this.store.dispatch(ApplicantAction.saveProfessionalSkills({ skills, profileId }));
  }

  saveBasicInfo(basicProfile: Model.BasicProfileInfo) {
    this.store.dispatch(ApplicantAction.saveApplicantBasicProfile({ basicProfile }));
  }

  getApplicantDashboard() {
    this.store.dispatch(ApplicantAction.applicantDashboard());
  }

  getUser(userId: string) {
    this.store.dispatch(ApplicantAction.getUserProfile({ userId }));
  }

  getApplicantById(applicantId: string) {
    this.store.dispatch(ApplicantAction.getApplicant({ applicantId }));
  }

  saveApplicant(applicant: Model.Applicant) {
    this.store.dispatch(ApplicantAction.saveApplicant({ applicant }));
  }

  saveApplicantBasicProfile(basicProfile: Model.BasicProfileInfo) {
    this.store.dispatch(ApplicantAction.saveApplicantBasicProfile({ basicProfile }));
  }

  setInitialForm(initialDetails: Model.InitialDetails) {
    this.store.dispatch(ApplicantAction.setInitialDetails({ initialDetails }));
  }

  setAdditionalInfo(additionalInfo: Model.AdditionalInfo) {
    this.store.dispatch(ApplicantAction.setAdditionalInfo({ additionalInfo }));
  }

  setProfileDocu(profileDocs: Model.ProfileDocuments) {
    this.store.dispatch(ApplicantAction.setProfileDocuments({ profileDocs }));
  }

  // getAllApplicant() {
  //   this.store.dispatch(ApplicantAction.getAllapplicant());
  // }

  // getApplicantDetails(userId: string) {
  //   this.store.dispatch(ApplicantAction.getApplicantDetails({ userId }));
  // }

  // saveProfile(userProfile: Model.Applicant) {
  //   this.store.dispatch(ApplicantAction.updateProfile({ userProfile }));
  // }

  //   resetFormState() {
  //     this.store.dispatch(ApplicantAction.resetApplicantForm());
  //   }

  //   saveApplicant(applicant: Model.Applicant) {
  //     this.store.dispatch(ApplicantAction.saveApplicant({ applicant }));
  //   }

  //   changeApplicantStatus(status:number, applicantId: string) {
  //     this.store.dispatch(ApplicantAction.changeApplicantStatus({ status, applicantId }));
  //   }

  //   saveInterview(interview: InterviewModel.InterviewQuestion[] ) {
  //     this.store.dispatch(ApplicantAction.setInterview({ interview }));
  //   }

  //   saveApplicantInfo(applicantInfo: Model.ApplicantInfo) {
  //     this.store.dispatch(ApplicantAction.setApplicantInfo({ applicantInfo }));
  //   }

  //   saveInitialForm(initialDetails: Model.InitialDetails) {
  //     this.store.dispatch(ApplicantAction.setApplicantInitialDetails({ initialDetails }));
  //   }

  //   getBasicList(companyId: string) {
  //     this.store.dispatch(ApplicantAction.getBasicApplicantList({ companyId }));
  //   }

  //   getExpiredList(companyId: string) {
  //     this.store.dispatch(ApplicantAction.getExpiredApplicantList({ companyId }));
  //   }

  //   getCategory() {
  //     this.store.dispatch(ApplicantAction.getCategoryList());
  //   }

  //   getIndustry() {
  //     this.store.dispatch(ApplicantAction.getIndustryList());
  //   }

  //   getBadge() {
  //     this.store.dispatch(ApplicantAction.getBadgeList());
  //   }

  //   getApplicantRole() {
  //     this.store.dispatch(ApplicantAction.getApplicantRoleList());
  //   }

    getLevel() {
      this.store.dispatch(ApplicantAction.getLevelList());
    }

    getSetup() {
      this.store.dispatch(ApplicantAction.getSetupList());
    }

    getType() {
      this.store.dispatch(ApplicantAction.getTypeList());
    }

  //   // getfeatureList() {

  //   // }

  //   // getfeatureDetails(featureId: string) {

  //   // }
}
