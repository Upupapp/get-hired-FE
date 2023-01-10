export interface BasicJob {
  jobId: string;
  jobBanner: string;
  jobTitle: string;
  companyId: string;
  jobTypeId: number;
  workSetupId: number;
  jobCountry: string;
  jobCity: string;
  salaryMinimum: number;
  salaryMaximum: number;
  salaryCurrency: string;
  companyName: string;
  jobTypeName: string;
  workSetupName: string;
  badges: Options[];
  tags: Options[];
}

export interface Options {
  id: number;
  name: string;
  icon?: string;
}
