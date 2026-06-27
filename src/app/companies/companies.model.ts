export interface BasicInfo {
  companyId: string;
  companyName: string;
  companyLogo: string;
  companyCategory?: string;
  companyJobsOpening: number;
  companyIndustry: string;
  slug?: string;
}

export interface Company {
  companyId: string;
  companyName: string;
  companyLogo: string;
  companyCategory?: string;
  companyJobsOpening?: number;
  companyIndustry: string;
  companyBanner: string;
  companyDetails: string;
  companyLogoUrl: string;
  industryId: number;
  workSetupId: number;
  numberOfEmployee: number;
  companyEmail: string;
  companyCity: string;
  companyContactNumber: string;
  companyCountry: string;
  companyAddress: string;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  slug?: string;
}
