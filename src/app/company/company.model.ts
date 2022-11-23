export interface Company {
  companyId: string;
  companyName: string;
  companyLogoUrl: string;
  companyDetails: string;
  industryId: number;
  workSetupId: number;
  numberOfEmployee: number;
  companyEmail: string;
  companyCity: string;
  companyContactNumber: string;
  companyCountry: string;
  companyAddress: string;
  createdAt: Date
  createdBy: string;
  updatedAt: Date;
  companyLogoFile?: File;
}

export interface Dashboard {
  company: {
    companyId: string;
    companyName: string;
    companyLogoUrl: string;
    companyCity: string;
    companyCountry: string;
    companyEmail: string;
  },
  charts: {
    activeJobs: number;
    applicants: number;
    interviews: number;
  },
  statistic: {
    totalHired: number;
    interviewAppointments: number;
  }
}

export interface Options {
  id: number;
  name: string;
  icon?: string;
}
