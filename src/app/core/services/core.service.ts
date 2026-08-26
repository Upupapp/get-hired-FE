import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, filter, map } from 'rxjs/operators';
import { BaseService } from './base.service';
import { environment } from "@environments/environment";
import { NavigationEnd, Router } from '@angular/router';
import { AuthFacade } from '@main/auth/state/auth.facade';

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

  /**
   * AUTH LIFECYCLE SYNC: a single reactive source of truth for "is this
   * browser tab currently authenticated", so components that render
   * auth-dependent UI (e.g. the public site header's Sign In vs Account
   * menu) can subscribe instead of reading isLoggedIn() once at
   * construction and going stale the moment logout() runs elsewhere in
   * the same tab -- previously the only way to see the updated UI was a
   * hard refresh (a fresh component instance re-reading localStorage).
   * Seeded from isLoggedIn() so a component that only ever reads the
   * current value (via a sync pipe/async pipe) still gets the right
   * state on first render, same as before this existed.
   */
  private authStateSubject = new BehaviorSubject<boolean>(this.isLoggedInSnapshot());
  authState$ = this.authStateSubject.asObservable();

  constructor(
    private baseService: BaseService,
    private router: Router,
    private authFacade: AuthFacade,
  ) {
    // Re-sync on every completed navigation. This is what actually keeps
    // authState$ correct after a successful sign-in (email/password,
    // Google, or LinkedIn -- three separate code paths that each write
    // localStorage['state'] directly and each navigate away on success)
    // without needing to touch every one of those write sites individually.
    // logout() below still pushes immediately too, since a logout action
    // doesn't always trigger a navigation on its own (e.g. a stale-session
    // guard that clears state without redirecting the current tab).
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this.authStateSubject.next(this.isLoggedInSnapshot()));
  }

  private isLoggedInSnapshot(): boolean {
    if (typeof localStorage === 'undefined') return false;
    return localStorage.getItem('state') === 'true';
  }

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

    // SIGNIN STALE-CREDENTIALS-REPLAY FIX: SigninComponent subscribes to
    // AuthFacade.credentials$ (an NgRx select(), which replays the current
    // store value to every new subscriber) as a class-field initializer --
    // i.e. on construction, unconditionally. AuthFacade.logout() existed
    // but was never called by the app's one real sign-out path, so the
    // store's `credentials` slice kept the last successful login response
    // forever (in-memory, survives client-side navigation). Any later
    // mount of SigninComponent -- even long after a genuine, complete
    // sign-out -- would immediately replay that stale response into
    // loggedIn(), silently re-establishing the old session and
    // self-navigating away from the sign-in page. Clearing the slice here
    // (resetCredentials() -> credentials: {...initAuth}, no `id` field, so
    // loggedIn()'s `user && user.id` guard is a no-op on replay) closes
    // that leak at its source instead of patching every subscriber.
    //
    // Deliberately LAST and try/caught: the local sign-out above (the part
    // that actually matters -- state/role/token removed) must complete
    // unconditionally, even if this store dispatch were ever to throw.
    try { this.authFacade.logout(); } catch (_) {}

    // AUTH LIFECYCLE SYNC: push immediately rather than waiting for the
    // next NavigationEnd -- a caller may not navigate at all right after
    // calling logout() (e.g. a guard clearing a stale session while
    // staying on the currently-rendering page), and any subscriber
    // (public header, etc.) must reflect "signed out" the instant this
    // method returns, not on some later, possibly-nonexistent navigation.
    this.authStateSubject.next(false);

    return of({ success: true, role: '' });
  }

  isLoggedIn() {
    return this.isLoggedInSnapshot();
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
