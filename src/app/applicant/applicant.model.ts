export interface User {
  userId: string;
  firstName: string;
  lastName: string;
  photoUrl: string;
  email: string;
}

export interface Applicant {
  applicantProfileId?: string;
  userId: string;
  firstName: string;
  lastName: string;
  photoUrl?: string;
  videoCVUrl?: string;
  jobTitle: string;
  rating?: number;
  workSetUpId: number;
  workSetupName: string;
  email: string;
  address?: string;
  contactNumber: string;
  city: string;
  country: string;
  shortBio: string;
  servicesProvided?: string;
  workExperience?: WorkExperience[];
  educationalBackground?: EducationalBackground[];
  certifications?: Certifications[];
  skills: string[];
  documents: Documents[];
  jobTypeId: number;
  jobTypeName?: string;
  jobLevelId: number;
  salaryMinimum: number;
  salaryMaximum: number;
  videoCVFile? : File;
  profileImage?: File;
  isProfileReady: boolean;
}

export interface WorkExperience {
  applicantId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  jobTitle: string;
  companyName: string;
  location: string;
  jobTypeId: string;
  jobTypeName?: string;
  startMonth: string;
  startYear: number;
  endMonth: string;
  endYear: number;
  isCurrentJob: boolean;
  details: string;
}

export interface EducationalBackground {
  applicantId?: string;
  createdAt?: Date;
  updatedAt?: Date;
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
  applicantId?: string;
  createdAt?: Date;
  updatedAt?: Date;
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
  profilePhotoFile?: File;
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

export interface AdditionalInfo {
  workExperience: WorkExperience[];
  educationalBackground: EducationalBackground[];
  professionalSkills: string[];
  certifications: Certifications[];
}

export interface Options {
  id: number;
  name: string;
  icon?: string;
}

export interface ProfileDocuments {
  documents: Documents[],
  videoCVFile?: File,
  videoCVUrl?: string
}

export interface Documents {
  file: File;
  filename: string;
  size: number;
  type: string;
  fileurl?: string;
  applicant_id?: string;
  created_at: Date;
}

export interface Dashboard {

}
