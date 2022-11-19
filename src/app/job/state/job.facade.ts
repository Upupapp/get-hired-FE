import { Injectable } from "@angular/core";
import * as Model from '../job.model';
import { State } from './job.reducer';
import { select, Store } from "@ngrx/store";
import * as JobAction from './job.actions';
import * as fromfeature from './job.selector';

@Injectable()
export class JobFacade {
  loading$ = this.store.pipe(select(fromfeature.loading));
  jobDetails$ = this.store.pipe(select(fromfeature.getJobDetails));
  jobList$ = this.store.pipe(select(fromfeature.getJobList));
  success$ = this.store.pipe(select(fromfeature.success));
  industry$ = this.store.pipe(select(fromfeature.getIndustryList));
  badge$ = this.store.pipe(select(fromfeature.getBadgeList));
  jobRole$ = this.store.pipe(select(fromfeature.getJobRoleList));
  setup$ = this.store.pipe(select(fromfeature.getSetupList));
  typeList$ = this.store.pipe(select(fromfeature.getTypeList));
  level$ = this.store.pipe(select(fromfeature.getLevelList));
  category$ = this.store.pipe(select(fromfeature.getCategoryList));

  initial$ = this.store.pipe(select(fromfeature.getIntialDetails));
  info$ = this.store.pipe(select(fromfeature.getJobInfo));
  interview$ = this.store.pipe(select(fromfeature.getJobInterview));

  error$: any;

  constructor(
    private store: Store<State>,
  ) { }

  // getAllJob() {
  //   this.store.dispatch(JobAction.getAlljob());
  // }

  // getJobDetails(userId: string) {
  //   this.store.dispatch(JobAction.getJobDetails({ userId }));
  // }

  // saveProfile(userProfile: Model.Job) {
  //   this.store.dispatch(JobAction.updateProfile({ userProfile }));
  // }

  saveJob(job: Model.Job) {
    this.store.dispatch(JobAction.saveJob({ job }));
  }

  saveJobInfo(jobInfo: Model.JobInfo) {
    this.store.dispatch(JobAction.setJobInfo({ jobInfo }));
  }

  saveInitialForm(initialDetails: Model.InitialDetails) {
    this.store.dispatch(JobAction.setJobInitialDetails({ initialDetails }));
  }

  getBasicList(companyId: string) {
    this.store.dispatch(JobAction.getBasicJobList({ companyId }));
  }

  getExpiredList(companyId: string) {
    this.store.dispatch(JobAction.getExpiredJobList({ companyId }));
  }

  getCategory() {
    this.store.dispatch(JobAction.getCategoryList());
  }

  getIndustry() {
    this.store.dispatch(JobAction.getIndustryList());
  }

  getBadge() {
    this.store.dispatch(JobAction.getBadgeList());
  }

  getJobRole() {
    this.store.dispatch(JobAction.getJobRoleList());
  }

  getLevel() {
    this.store.dispatch(JobAction.getLevelList());
  }

  getSetup() {
    this.store.dispatch(JobAction.getSetupList());
  }

  getType() {
    this.store.dispatch(JobAction.getTypeList());
  }

  // getfeatureList() {

  // }

  // getfeatureDetails(featureId: string) {

  // }
}
