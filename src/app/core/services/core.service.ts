import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BaseService } from './base.service';
import { environment } from "@environments/environment";
import { Router } from '@angular/router';
import { AI_CREATE_DRAFT_STORAGE_KEY } from '@app-job/services/ai-create-draft.service';

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

  /**
   * GETHIRED_EMPLOYER_PORTAL_SIGNOUT_FIX: the canonical logout method --
   * every caller (interceptor, all panel components) already goes through
   * this. Previously left as a literal "TODO api for firebase logout" --
   * the backend's real session-revoke endpoint (POST /auth/logout ->
   * revokeTokenInFirebase(uid), see get-hired-BE/routes/userRoute.js) was
   * never actually called, so a "signed out" browser could still hold a
   * server-side-valid refresh token. That call fires here, BEFORE the
   * local token is cleared below (verifyAuth needs the current
   * Authorization header) -- fire-and-forget: never awaited, never blocks
   * the local sign-out. This app's actual "am I logged in" state is
   * entirely local (the `state`/`user` keys read by isLoggedIn()/route
   * guards), so a network hiccup on the revoke call must not leave the
   * user stuck unable to sign out of their own browser, and every existing
   * caller of this method keeps its current synchronous contract --
   * nothing needs to subscribe to anything for the actual sign-out to
   * complete. The returned Observable exists only so a caller that wants
   * completion timing (e.g. a confirmation-modal loading state) can use it.
   */
  logout() {
    this.baseService.post(`${this.authUrl}/logout`, {}).subscribe({
      next: () => {},
      error: () => {}, // best-effort -- never blocks local sign-out
    });

    this.isLogin = false;
    this.roleAs = '';
    // A real session-expiry logout (the global 401/403 interceptor calls
    // this) must not destroy a pending AI Create draft -- see
    // ai-create-draft.service.ts / easy-job-post-assistant-modal.component.ts.
    // This key is preserved across the clear; every other key is wiped as before.
    const preservedAiCreateDraft = localStorage.getItem(AI_CREATE_DRAFT_STORAGE_KEY);
    localStorage.setItem('state', 'false');
    localStorage.setItem('role', '');
    localStorage.clear();
    if (preservedAiCreateDraft) {
      localStorage.setItem(AI_CREATE_DRAFT_STORAGE_KEY, preservedAiCreateDraft);
    }
    return of({ success: true, role: '' });
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
