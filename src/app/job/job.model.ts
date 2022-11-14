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
  rate?: string;
  jobAddress?: string;
  createdAt?: Date;
  updatedAt?: Date;
  expirationDate?: Date;
  jobStatusId?: number;
  jobCity?: string;
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

export interface Options {
  id: number;
  name: string;
  icon?: string;
}
