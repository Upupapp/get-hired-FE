import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { BaseService } from './base.service';
import { environment } from "@environments/environment";
import { Router } from '@angular/router';

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
    localStorage.setItem('state', 'false');
    localStorage.setItem('role', '');
    localStorage.clear();
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

  resetLocalStorage(user) {
    // TODO
  }
}
