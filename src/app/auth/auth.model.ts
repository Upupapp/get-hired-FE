export interface Credentials {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  password? : string;
  role?: number;
  photoUrl?: string;
  token?: string;
  refreshToken?: string;
  recaptchaToken?: string;
}

export interface User {
    uid: string;
    firstName: string;
    middleName: string;
    lastName: string;
    dateOfBirth: Date;
    age: number;
    email: string;
    gender: string;
    phoneNumber: string;
    cellNumber: string;
    photoURL: string;
    photoUrl?: string;
    address: string;
    zip: string;
    city: string;
    addressB: string;
    avatar?: string;
    roleTitle?: string;
    department?: string;
    shortBio?: string;
    linkedinUrl?: string;
    publicProfileEnabled?: boolean;
    showPhotoPublicly?: boolean;
    showTitlePublicly?: boolean;
    showBioPublicly?: boolean;
    showLinkedinPublicly?: boolean;
    showEmailPublicly?: boolean;
    showPhonePublicly?: boolean;
}
