import { Injectable } from '@angular/core';
import { BaseService } from '@main/core/services/base.service';
import { environment } from 'environments/environment';
import { of } from 'rxjs';
import * as Model from './admin.model';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  adminUrl = `${environment.api_url}/admin`;
  authUrl = `${environment.api_url}/auth`;

  constructor(private baseService: BaseService) { }

  getAdmin(userId: string) {
    return this.baseService.get<Model.Admin>(
      `${this.adminUrl}/profile?id=${userId}`
    );
  }

  getDashboardDetails() {
    return this.baseService.get<any>(`${this.adminUrl}/dashboard`);
  }

  userProfile(userId: string) {
    return this.baseService.get<any>(`${this.adminUrl}/userprofile?id=${userId}`);
  }

  getVerificationLink(email: string) {
    return this.baseService.post<any>(`${this.authUrl}/getverificationlink?email=${email}`);
  }
}
