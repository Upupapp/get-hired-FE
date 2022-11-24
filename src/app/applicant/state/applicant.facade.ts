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
  // applicantList$ = this.store.pipe(select(fromfeature.getApplicantList));
  // success$ = this.store.pipe(select(fromfeature.success));
  // industry$ = this.store.pipe(select(fromfeature.getIndustryList));
  // badge$ = this.store.pipe(select(fromfeature.getBadgeList));
  // applicantRole$ = this.store.pipe(select(fromfeature.getApplicantRoleList));
  // setup$ = this.store.pipe(select(fromfeature.getSetupList));
  // typeList$ = this.store.pipe(select(fromfeature.getTypeList));
  // level$ = this.store.pipe(select(fromfeature.getLevelList));
  // category$ = this.store.pipe(select(fromfeature.getCategoryList));

  // initial$ = this.store.pipe(select(fromfeature.getIntialDetails));
  // info$ = this.store.pipe(select(fromfeature.getApplicantInfo));
  // interview$ = this.store.pipe(select(fromfeature.getApplicantInterview));
  // getApplicantById$ = this.store.pipe(select(fromfeature.getApplicantById));
  // getApplicantLoading$ = this.store.pipe(select(fromfeature.applicantLoading));
  error$: any;

  constructor(private store: Store<State>) {}

  getApplicantById(applicantId) {
    this.store.dispatch(ApplicantAction.getApplicant({ applicantId }));
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

  //   getLevel() {
  //     this.store.dispatch(ApplicantAction.getLevelList());
  //   }

  //   getSetup() {
  //     this.store.dispatch(ApplicantAction.getSetupList());
  //   }

  //   getType() {
  //     this.store.dispatch(ApplicantAction.getTypeList());
  //   }

  //   // getfeatureList() {

  //   // }

  //   // getfeatureDetails(featureId: string) {

  //   // }
}
