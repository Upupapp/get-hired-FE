import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { BaseService } from './base.service';
import { environment } from "@environments/environment";
import { Router } from '@angular/router';
import { GUEST_JOB_DRAFT_STORAGE_KEY } from '@app-job/services/guest-job-draft.service';

@Injectable({
  providedIn: 'root'
})
export class CoreService {

  asyncLocalStorage = {
    setItem: function (key, value) {
      return Promise.resolve().then(function () {
        localStorage.setItem(key, value);
      });
    },
    getItem: function (key) {
      return Promise.resolve().then(function () {
        return localStorage.getItem(key);
      });
    }
  };

  authUrl = `${environment.api_url}/auth`;
  isLogin = false;
  roleAs: string;

  constructor(
    private baseService: BaseService,
    private router: Router
  ) { }

  checkEmailIfExist(email: string) {
    return this.baseService.get(`${this.authUrl}/checkemailifexist?email=${email}`);
  }

  logout() {
    // TODO api for firebase logout
    this.isLogin = false;
    this.roleAs = '';
    // A real session-expiry logout (the global 401/403 interceptor calls
    // this) must not destroy a pending guest job draft -- see
    // guest-job-draft.service.ts / ai-job-preview-panel.component.ts. This
    // key is preserved across the clear; every other key is wiped as before.
    const preservedGuestJobDraft = localStorage.getItem(GUEST_JOB_DRAFT_STORAGE_KEY);
    localStorage.setItem('state', 'false');
    localStorage.setItem('role', '');
    localStorage.clear();
    if (preservedGuestJobDraft) {
      localStorage.setItem(GUEST_JOB_DRAFT_STORAGE_KEY, preservedGuestJobDraft);
    }
    return of({ success: !this.isLogin, role: '' });
  }

  isLoggedIn() {
    const loggedIn = localStorage.getItem('state') || null;
    if (loggedIn == 'true')
      return true;
    else
      return false;
  }

  async getState() {
    const state = await this.asyncLocalStorage.getItem('state');
    return state == 'true' ? true : false;
  }

  getRole() {
    return this.asyncLocalStorage.getItem('role');
  }

  async getUserId() {
    const user = await this.asyncLocalStorage.getItem('user');
    return JSON.parse(user)._id;
  }

  async getUserFullName() {
    const user = await this.asyncLocalStorage.getItem('user');
    return JSON.parse(user).firstName + ' ' + JSON.parse(user).lastName;
  }

  resetLocalStorage(user) {
    // TODO
  }
}
