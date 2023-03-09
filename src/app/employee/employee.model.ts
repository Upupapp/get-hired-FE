export interface Employee {
  id?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  gender?: string;
  phoneNumber?: string;
  address?: string;
  zip?: string;
  city?: string;
  isProfileUpdated: boolean,
  companyName?: string;
}

export interface EmployeeCompany {
  employeedCompanyId: string;
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
  companyState: string;
  companyTown: string;
  companyZip: string;
  companyMapUrl: string;
  companyAddressOne: string;
}
