export interface BasicInfo {
  companyId: string;
  companyName: string;
  companyLogo: string;
  companyCategory?: string;
  companyJobsOpening: number;
  companyIndustry: string;
}

export interface Company {
  companyId: string;
  companyName: string;
  companyLogo: string;
  companyCategory?: string;
  companyJobsOpening?: number;
  companyIndustry: string;
}
