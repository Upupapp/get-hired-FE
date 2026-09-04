import * as InterviewModel from '@main/interview/interview.model';

/**
 * GETHIRED JOB CERTIFICATION REQUIREMENTS v1 -- structured, additive to
 * the existing free-text requirements/goodToHave fields. Free-text first:
 * canonicalKey is nullable and unused until a future MATCH pass builds
 * comparison/taxonomy logic against it (see
 * GETHIRED_MATCH_CERTIFICATION_LICENSE_DISCOVERY.md). Not consumed by
 * JobCompatibilityService in this pass -- display/data-model only.
 */
export interface JobCertificationRequirement {
  id?: string;
  name: string;
  type: 'certification' | 'license' | 'permit' | 'eligibility' | 'other';
  importance: 'required' | 'preferred';
  issuingAuthority?: string | null;
  expiryRequired?: boolean;
  verificationRequired?: boolean;
  canonicalKey?: string | null;
}

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
  certificationRequirements?: JobCertificationRequirement[];
  badges?: Options[];
  skills?: string[];
  tags?: string[];
  rate?: string;
  companyName?: string;
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
  certificationRequirements?: JobCertificationRequirement[];
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
  salaryCurrency?: string;
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

export interface CompanySubscriptions {
  companyId: string;
  createdAt: Date;
  isPaid: boolean;
  paymentDate: Date;
  subscriptionId: number;
  jobPost: number;
  jobPostCount:number;
  admin: number;
  adminCount: number;
  videoResponse: number;
  videoResponseCount: number;
  withCustomerCare: boolean;
  price: number;
  priceCurrency: string;
  subscriptionName: string;
  paymentOccurence: string;
  endAt: Date;
}
