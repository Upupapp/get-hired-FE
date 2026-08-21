import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BaseService } from './base.service';
import { environment } from "@environments/environment";
import { Router } from '@angular/router';

// TARGETED LOCAL-STORAGE CLEANUP: the complete set of keys this app itself
// ever writes as part of establishing an authenticated session (signin.
// component.ts, google-auth.service.ts, linkedin-auth.service.ts, and the
// legacy admin/applicant/company auth guards' token-refresh paths). This is
// logout()'s exact inverse -- every key here, and only these, are removed
// on sign-out. Deliberately NOT a localStorage.clear(): this storage is
// also where AiCreateDraftService keeps owner-isolated AI Create recovery
// (one key per owner scope, plus a guest journey/resume-intent pointer) --
// a blanket clear() would just as happily delete a DIFFERENT Employer's
// recovery, an unrelated in-progress guest's recovery, or any other
// unrelated persistent browser data that happens to live in the same
// storage, none of which has anything to do with THIS user's session.
const AUTH_SESSION_STORAGE_KEYS: string[] = [
  'state', 'role', 'user', 'token', 'token_authorization', 'refreshToken',
  'loginMessage', 'loginError', 'signupError', 'notFound',
  'withActiveSubscription', 'adminLogin', 'refreshTokenMessage', 'returnURL',
];

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
    private router: Router,
  ) { }

  checkEmailIfExist(email: string) {
    return this.baseService.get(`${this.authUrl}/checkemailifexist?email=${email}`);
  }

  /**
   * STALE UNAUTHGUARD STATE HARDENING: the only backend-authoritative check
   * of whether the current Authorization header is actually still valid --
   * GET /auth/getprofile (verifyAuth middleware, role-agnostic, already
   * used server-side; nothing new added to the backend). Reused here rather
   * than trusting localStorage.state alone, which just records what the
   * last successful signin claimed and never gets revalidated on its own.
   * Resolves (200) only for a genuinely current session; rejects (401/403)
   * otherwise -- callers should treat any error as "not actually logged
   * in," never assume success.
   */
  verifySession() {
    return this.baseService.get(`${this.authUrl}/getprofile`);
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
   *
   * TARGETED LOCAL-STORAGE CLEANUP: removes only AUTH_SESSION_STORAGE_KEYS
   * (this app's own complete auth/session key set) -- never
   * localStorage.clear(). A blanket clear() has no concept of ownership: it
   * would delete a different Employer's AI Create recovery, an unrelated
   * in-progress guest's recovery, or any other unrelated persistent data in
   * the same storage, none of which belongs to the session being ended
   * here. Per-owner recovery removal (the sign-out confirmation's optional
   * checkbox) is a separate, explicit, single-key action the caller takes
   * via AiCreateDraftService.clear(ownerScope) -- this method never needs
   * to know that key exists, let alone preserve/restore it.
   */
  logout() {
    this.baseService.post(`${this.authUrl}/logout`, {}).subscribe({
      next: () => {},
      error: () => {}, // best-effort -- never blocks local sign-out
    });

    this.isLogin = false;
    this.roleAs = '';
    for (const key of AUTH_SESSION_STORAGE_KEYS) {
      try { localStorage.removeItem(key); } catch (_) {}
    }
    // Explicit signed-out values (not just removal) for the two keys
    // isLoggedIn()/route guards actually read, matching this method's
    // previous observable behavior.
    try {
      localStorage.setItem('state', 'false');
      localStorage.setItem('role', '');
    } catch (_) {}

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
