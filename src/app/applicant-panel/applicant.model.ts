export interface ApplicantProfile {
  applicantId: string;
  photoUrl: string;
  jobTitle: string;
  shortBio: string;
  servicesProvided: string;
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

export interface Applicant {
  applicantId: string;
  firstName: string;
  lastName: string;
  photoUrl: string;
  videoCVUrl: string;
  jobTitle: string;
  rating: number;
  workSetupName: string; // Full time etc.
  email: string;
  address: string;
  contactNumber: string;
  shortBio: string;
  servicesProvided: string;
  workExperience: [];
  educationalBackground: [];
  certifications: [];
  skills: [];
  documents: [];
  jobTypeId: number;
  jobLevelId: number;
  jobSetupId: number;
  salaryMinimum: number;
  salaryMaximum: number;
}
