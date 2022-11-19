import * as InterviewModel from '@main/interview/interview.model';

export interface Job {
  jobId?: string;
  jobBanner?: string;
  jobTitle: string;
  companyId: string;
  industryId?: number;
  jobRoleId?: number;
  jobTypeId?: number;
  jobLevelId?: number;
  jobDescription?: string;
  jobDuties?: string;
  workSetupId?: number;
  salaryMinimum?: number;
  salaryMaximum?: number;
  jobAddress?: string;
  createdAt?: Date;
  updatedAt?: Date;
  expirationDate?: Date;
  jobStatusId?: number;
  jobCity?: string;
  bannerFile?: File;
  interviewQuestions?: InterviewModel.InterviewQuestion[];
  requirements?: string[];
  goodToHave?: string[];
  educationalBackground?: string[];
  badges?: Options[];
  jobSkills?: string[];
  jobTags?: string[];
  rate?: string;
}

export interface InitialDetails {
  jobTitle: string;
  jobTypeId?: number;
  jobLevelId?: number;
  workSetupId?: number;
  jobAddress?: string;
  jobCity?: string;
  jobBanner?: string;
  bannerFile?: File;
  badges: Options[];
  jobDescription?: string;
  jobDuties?: string;
  requirements?: string[];
  goodToHave?: string[];
  educationalBackground?: string[];
  jobCategoryId?: number;
}

export interface JobInfo {
  industryId?: number;
  jobRoleId?: number;
  jobSkills?: string[];
  jobTags?: string[];
  rate?: string;
  salaryMinimum?: number;
  salaryMaximum?: number;
  contractStart: DetailedDate;
  contractEnd: DetailedDate;
}

export interface DetailedDate {
  month: string;
  day: number;
  year: number;
}

export interface Options {
  id: number;
  name: string;
  icon?: string;
}

export interface BasicList {
  jobId: string;
  jobTitle: string;
  companyId: string;
  jobTypeId: number;
  jobTypeName: string;
  workSetupId: number;
  workSetupName: string;
  salaryMinimum: number;
  salaryMaximum: number;
  createdAt: Date;
  jobStatusId: number;
  jobCity: string;
}
