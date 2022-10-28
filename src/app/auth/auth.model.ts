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
}
