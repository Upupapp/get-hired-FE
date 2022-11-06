import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { BaseService } from './base.service';
import { environment } from "@environments/environment";
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class CoreService {

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
    return of({ success: this.isLogin, role: '' });
  }

  isLoggedIn() {
    const loggedIn = localStorage.getItem('state');
    if (loggedIn == 'true')
      return true;
    else
      return false;
  }

  getRole() {
    this.roleAs = localStorage.getItem('role');
    return this.roleAs;
  }
}
