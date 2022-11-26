export interface Applicant {
  applicantId: string;
  firstName: string;
  lastName: string;
  photoUrl: string;
  videoCVUrl: string;
  jobTitle: string;
  rating: number;
  workSetupName: string;
  email: string;
  address: string;
  contactNumber: string;
  shortBio: string;
  servicesProvided: string;
  workExperience?: WorkExperience;
  educationalBackground?: EducationalBackground;
  certifications?: Certifications;
  skills: [];
  documents: [];
  jobTypeId: number;
  jobLevelId: number;
  jobSetupId: number;
  salaryMinimum: number;
  salaryMaximum: number;
}

export interface WorkExperience {
  applicantId: string;
  createdAt: Date;
  updatedAt: Date;
  jobTitle: string;
  companyName: string;
  location: string;
  jobTypeId: string;
  startMonth: string;
  startYear: number;
  endMonth: string;
  endYear: number;
  isCurrentJob: boolean;
  details: string;
}

export interface EducationalBackground {
  applicantId: string;
  createdAt: Date;
  updatedAt: Date;
  educLevelId: number;
  educLevelName: string;
  fieldOfStudy: string;
  school: string;
  schoolAddress: string;
  startMonth: string;
  startYear: number;
  endMonth: string;
  endYear: number;
}

export interface Certifications {
  applicantId: string;
  createdAt: Date;
  updatedAt: Date;
  certTitle: number;
  noExpiry: boolean;
  startMonth: string;
  startYear: number;
  endMonth: string;
  endYear: number;
  details: string;
}

export interface InitialDetails {
  profilePhoto: string;
  profilePhotoFile: File;
  jobTitle: string;
  shortBio: string;
  servicesProvided: string;
  jobTypeId: number;
  jobLevelId: number;
  workSetupId: number;
  salaryMinimum: number;
  salaryMaximum: number;
  firstName: string;
  lastName: string;
  address: string;
  contactNumber: string;
  city: string;
  country: string;
}

export interface Options {
  id: number;
  name: string;
  icon?: string;
}
