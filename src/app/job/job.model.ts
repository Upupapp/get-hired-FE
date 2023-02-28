import * as InterviewModel from '@main/interview/interview.model';

export interface Job {
  jobId?: string;
  jobBanner?: string;
  jobTitle: string;
  companyId: string;
  industryId?: number;
  industryName?: string;
  jobRoleId?: number;
  jobTypeId?: number;
  jobTypeName?: string;
  jobLevelId?: number;
  jobDescription?: string;
  jobDuties?: string;
  workSetupId?: number;
  workSetupName?: string;
  salaryMinimum?: number;
  salaryMaximum?: number;
  salaryCurrency?:string;
  jobAddress?: string;
  createdAt?: Date;
  updatedAt?: Date;
  expirationDate?: Date;
  jobStatusId?: number;
  jobCity?: string;
  jobCountry?: string;
  bannerFile?: File;
  isInterviewRequired: boolean;
  interviewQuestions?: InterviewModel.InterviewQuestion[];
  interviewTemplateId?: string;
  requirements?: string[];
  goodToHave?: string[];
  educationalBackground?: string[];
  badges?: Options[];
  skills?: string[];
  tags?: string[];
  rate?: string;
  bannerPosition?: any;
  companyCity?: string;
  companyCountry?: string;
  companyLogoUrl?: string;
  companyDetails?: string;
  companyRating?: number;
  numberOfEmployee?: string;
  jobCategoryId?: number;
  isApplied?: boolean;
}

export interface InitialDetails {
  jobTitle: string;
  jobTypeId?: number;
  jobLevelId?: number;
  workSetupId?: number;
  jobAddress?: string;
  jobCity?: string;
  jobCountry?: string;
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
  skills?: string[];
  tags?: string[];
  rate?: string;
  salaryMinimum?: number;
  salaryMaximum?: number;
  contractStart?: DetailedDate;
  contractEnd?: DetailedDate;
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
  rate: string;
}

export interface JobApplicants {
  applicantProfileId: string;
  userId: string;
  firstName: string;
  lastName: string;
  photoUrl: string;
  salaryMinimum: number;
  salaryMaximum: number;
  email: string;
  city: string;
  country: string;
  videoCVUrl: string;
  jobApplicationStatusId: string;
  dateApplied: Date,
  workSetupId: number;
  workSetupName: string;
  jobTypeId: number;
  jobTypeName: string;
}

export interface JobApplicantDetails {
  profile: any,
  interviewQuestions: any[],
  profileDocs: any[],
  answers: any[]
}
