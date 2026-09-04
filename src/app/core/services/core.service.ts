import { Injectable } from '@angular/core';
import { BehaviorSubject, of, race, timer } from 'rxjs';
import { catchError, filter, map, shareReplay } from 'rxjs/operators';
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
   * SECURITY-LOGOUT-COUNTDOWN RACE FIX: a password change invalidates the
   * session token on the BACKEND the instant it succeeds -- but
   * SecurityLogoutCountdownComponent intentionally keeps the app locally
   * "logged in" for a few more seconds (a graceful, explained countdown
   * instead of an abrupt logout). In that window, any other in-flight or
   * newly-fired request (background polling, e.g. the dashboard's profile-
   * readiness check / job recommendations) hits the backend with the now-
   * dead token, gets a 401, and UnAuthorizedInterceptor -- unaware the
   * countdown modal already has this covered -- independently force-logs-
   * out, shows its own "Your session has expired" toast, and redirects,
   * stomping on the countdown modal mid-animation. Set true for the
   * duration of that countdown (see SecurityLogoutCountdownComponent) so
   * the interceptor defers entirely to the modal's own logout() call at
   * zero; reset unconditionally in logout() below so it can never leak
   * into a later, genuinely new session.
   */
  suppressExpiryHandling = false;

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
   * this. The backend's real session-revoke endpoint (POST /auth/logout ->
   * revokeTokenInFirebase(uid), see get-hired-BE/routes/userRoute.js) is
   * called near the bottom of this method -- its Authorization token is
   * captured into `tokenForRevoke` at the very top, BEFORE local cleanup
   * removes it from localStorage, and passed explicitly on that request
   * (see the SIGNOUT-NAVIGATION-ABORTS-IN-FLIGHT-REQUEST note below for
   * why: the request is a cold observable that doesn't actually fire until
   * the caller subscribes, which happens after this method has already
   * returned and already cleared localStorage). This app's actual "am I
   * logged in" state is entirely local (the `state`/`user` keys read by
   * isLoggedIn()/route guards) and is cleared unconditionally below,
   * regardless of what the revoke call does -- a network hiccup must never
   * leave the user stuck unable to sign out of their own browser. Every
   * caller that cares about completion timing (e.g. not navigating away
   * until the revoke call has had a real chance to reach the server)
   * should subscribe to the returned Observable; see its own comment.
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
    // Captured BEFORE the cleanup below removes it -- the revoke request
    // constructed further down is a COLD observable (HttpClient requests
    // don't actually fire until something subscribes), and the caller only
    // subscribes to what this method returns AFTER this method has already
    // returned. By then localStorage['token'] would already be gone, and
    // both auth interceptors only attach an Authorization header when
    // localStorage.getItem('token') is truthy -- skipping entirely once
    // it's cleared. Passed explicitly as a request header below so the
    // revoke call still authenticates correctly regardless of when it
    // actually fires relative to the cleanup.
    const tokenForRevoke = localStorage.getItem('token');

    this.isLogin = false;
    this.roleAs = '';
    this.suppressExpiryHandling = false;
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

    // NAVIGATION-ABORTS-IN-FLIGHT-REQUEST FIX: this used to fire the
    // backend's session-revoke call (POST /auth/logout ->
    // revokeTokenInFirebase(uid)) via a disconnected .subscribe() and
    // return an always-immediately-emitting of(...) regardless of that
    // call's real status. A caller that navigates as soon as this
    // Observable emits (e.g. window.location.href = '/' right after
    // .subscribe()) could then trigger a full page navigation WHILE the
    // revoke request was still in flight -- browsers can and do abort
    // in-flight requests on navigation, so the request server never
    // actually ran revokeRefreshTokens(): the session silently never got
    // revoked, even though every local sign-out step above (localStorage,
    // NgRx store, authState$) still completed correctly. That's the
    // "Google sign-out works, email/password doesn't reliably" /
    // "hard-reload sign-out still loops back to the dashboard" bug.
    //
    // The returned Observable now genuinely reflects the revoke call's
    // completion, race()'d against a 1.5s timer so a slow/dead network can
    // never trap a user on the page -- every caller already navigates
    // (or not) the same way it did before, just now only after the revoke
    // request has actually had a real chance to reach the server. Local
    // sign-out above is unconditional regardless of which side of the
    // race wins.
    // shareReplay(1): several existing callers (header.component.ts,
    // UnAuthorizedInterceptor's auto-logout-on-401, UnauthGuard's
    // self-heal) call coreService.logout() as a bare statement and never
    // subscribe to what it returns -- with a plain cold observable, the
    // HTTP request would then never actually execute at all. Subscribing
    // once internally below guarantees it always fires exactly once,
    // regardless of caller behavior; shareReplay(1) means a caller that
    // DOES subscribe to the returned race() (to wait for real completion
    // before navigating) replays that same single execution instead of
    // triggering a second, duplicate revoke request.
    const revokeCall$ = this.baseService.post(
      `${this.authUrl}/logout`,
      {},
      tokenForRevoke ? { headers: { Authorization: tokenForRevoke } } : {},
    ).pipe(
      map(() => ({ success: true, role: '' })),
      catchError(() => of({ success: true, role: '' })), // best-effort -- local sign-out already happened above
      shareReplay(1),
    );
    revokeCall$.subscribe();

    return race(revokeCall$, timer(1500).pipe(map(() => ({ success: true, role: '' }))));
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
