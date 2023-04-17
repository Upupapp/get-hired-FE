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
  companyIndustryName? : string;
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


export interface Dashboard {
  company: any;
  charts: any;
  graph: any;
  jobViews: any,
  stat: {
    contacts: string;
    applicants: string;
  }
  // company: {
  //   companyId: string;
  //   companyName: string;
  //   companyLogoUrl: string;
  //   companyCity: string;
  //   companyCountry: string;
  //   companyEmail: string;
  // },
  // charts: {
  //   activeJobs: number;
  //   applicants: number;
  //   interviews: number;
  // },
  statistic?: {
    contacts: string;
    applicants: string;
  },
  // graph: [{
  //   month: number;
  //   day: number;
  //   count: number;
  // }],
  totalContacts?: number;
  cities?: [{
    city: string;
    count: string;
  }]
}

export interface Options {
  id: number;
  name: string;
  icon?: string;
}

export interface CompanyUser {
  employeeId: string;
  companyId: string;
  assignedAt: Date;
  email: string;
  fullName: string;
}
