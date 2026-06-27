import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import { BaseService } from "@main/core/services/base.service";
import { of } from "rxjs";
import * as Model from "./auth.model";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  authUrl = `${environment.api_url}/auth`;

  constructor(
    private baseService: BaseService
  ) { }

  getUserCredentials(email: string) {
    return this.baseService.get(`${this.authUrl}/getcredentials?email=${email}`);
  }

  getRefreshToken(): any {
    const body = { token: localStorage.getItem('refreshToken') };
    if (!body.token) {
      return this.baseService.post(`${this.authUrl}/refreshtoken`);
    } else return of(false);
  }

  checkEmailIfExist(email: string) {
    return this.baseService.get(`${this.authUrl}/checkemailifexist?email=${email}`);
  }

  signIn(loginCredentials: { email: string, password: string }) {
    return this.baseService.post<Model.Credentials>(`${this.authUrl}/signin`, loginCredentials);
  }

  signUp(credentials: Model.Credentials) {
    return this.baseService.post<Model.Credentials>(`${this.authUrl}/signup`, credentials);
  }

  verifyEmailLink(oobCode: string) {
    return this.baseService.post(`${this.authUrl}/verifyemail?oobCode=${oobCode}`);
  }

  resendVerification(email: string) {
    return this.baseService.post(`${this.authUrl}/resendverificationlink?email=${email}`);
  }

  getEmailPwLink(email: string) {
    return this.baseService.get(`${this.authUrl}/getpwresetlink?email=${email}`);
  }

  changePw(code: string, pw: string, email: string) {
    const body = {
      oobCode: code,
      pw,
      email
    };

    return this.baseService.post(`${this.authUrl}/changepassword`, body);
  }

  changePasswordInSession(payload: {
    currentPassword: string;
    newPassword: string;
    signOutOtherSessions: boolean;
    clientEventId: string;
  }) {
    return this.baseService.post(`${this.authUrl}/account/change-password`, payload);
  }

  getUserProfile() {
    return this.baseService.get<Model.User>(`${this.authUrl}/getprofile`);
  }

  updateUserProfile(user: Model.User) {
    return this.baseService.put<Model.User>(`${this.authUrl}/updateprofile`, user);
  }
}
