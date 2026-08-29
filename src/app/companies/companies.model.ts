export interface CompanyListItem {
  companyId: string;
  displayName: string;
  slug: string;
  logoUrl: string | null;
  industry: string | null;
  location: string | null;
  workSetup: string | null;
  employeeCount: number | null;
  openJobs: number;
}

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

export interface PublicHiringStep {
  step: number;
  title: string;
  description: string;
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
  // True only for a renamed duplicate ("Company Name #2", etc.) from the
  // historical-duplicates backfill -- drives the "duplicate listing" banner.
  isDuplicate?: boolean;
  seo: {
    title: string;
    description: string;
    canonical: string;
    ogImage: string | null;
  };
  snapshot: {
    industry: string | null;
    companySize: string | null;
    workSetup: string | null;
    location: string | null;
    openRoles: number;
    lastUpdated: string | null;
    hiringOnGetHired: boolean;
  };
  whyJoinUs: {
    about: string | null;
    hasContent: boolean;
  };
  hiringProcess: {
    steps: PublicHiringStep[];
    isDefault: boolean;
  };
  benefits: {
    items: string[];
    hasContent: boolean;
  };
  navigation: {
    tabs: string[];
  };
}

export interface PublicCompanyFollowState {
  following: boolean;
  available: boolean;
  loading: boolean;
  message?: string;
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
