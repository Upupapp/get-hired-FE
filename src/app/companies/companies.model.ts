export interface PublicJob {
  jobId: string;
  jobTitle: string;
  workSetup: string | null;
  jobType: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string | null;
  rate: string | null;
  location: string | null;
  postedAt: string | null;
}

export interface PublicCompanyProfile {
  slug: string;
  companyId: string;
  displayName: string;
  about: string | null;
  industry: string | null;
  workSetup: string | null;
  workSetupId: number | null;
  companySize: string | null;
  location: string | null;
  logo: { url: string; alt: string } | null;
  heroBanner: { url: string; alt: string } | null;
  openJobsCount: number;
  updatedAt: string | null;
  seo: {
    title: string;
    description: string;
    canonical: string;
    ogImage: string | null;
  };
}

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
