import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router, UrlSegment, Route, CanActivateChild, CanDeactivate, CanLoad, ActivatedRoute, Routes } from '@angular/router';
import { Observable, of } from 'rxjs';
import { CoreService } from '@app-core/services/core.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { adminRoutes, applicantRoutes, authRoutes, employerRoutes } from './routes';

@Injectable({
  providedIn: 'root'
})
export class UnauthGuard implements CanActivate, CanActivateChild, CanDeactivate<unknown>, CanLoad {
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

  constructor(
    private router: Router,
    private coreService: CoreService,
    private activatedRoute: ActivatedRoute
  ) { }

  // REDIRECT-LOOP RATE-LIMIT GUARD: if this guard JUST determined (within
  // the last few seconds) that a locally-claimed session is actually
  // invalid, don't re-verify against the backend again on every immediately-
  // repeated /signin visit -- go straight to the self-heal. Without this, a
  // tight loop (whatever repeatedly re-triggers navigation back to /signin)
  // fires a fresh GET /auth/getprofile every single time, which is exactly
  // what was exhausting that endpoint's rate limit ("spamming until
  // blocked"). This guard is providedIn:'root' (a true singleton), so this
  // state persists across calls within the same browser tab/session.
  private lastInvalidCheckAt = 0;
  private static readonly INVALID_CHECK_COOLDOWN_MS = 5000;

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    let url: string = state.url;
    return this.checkUserLogin(next, url);
  }
  canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.canActivate(next, state);
  }
  canDeactivate(
    component: unknown,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return true;
  }

  canLoad(
    route: Route,
    segments: UrlSegment[]): Observable<boolean> | Promise<boolean> | boolean {
    return this.checkUserLogin();
  }

  async checkUserLogin(route?: ActivatedRouteSnapshot, url?: any): Promise<boolean> {
    const logged = await this.asyncLocalStorage.getItem('state');
    if (logged != 'true') {
      // No local claim of an active session at all -- render the auth page
      // normally. No network call needed for the common, true-guest case.
      return true;
    }

    // STALE UNAUTHGUARD STATE HARDENING: a local claim of being logged in
    // exists, but that boolean alone is not proof -- it just records what
    // the last successful signin wrote, and is never revalidated on its
    // own (e.g. a tab closed without signing out leaves it "true"
    // indefinitely). Verify against the one backend-authoritative source
    // of truth (CoreService.verifySession() -> GET /auth/getprofile,
    // already used server-side, nothing new added) before deciding to
    // redirect away from the auth page. Angular already awaits this whole
    // async guard before rendering anything, so this adds a brief resolve
    // delay for the stale-state case only -- never a flash of the wrong
    // page, and never a redirect loop (both branches below terminate).
    if (Date.now() - this.lastInvalidCheckAt < UnauthGuard.INVALID_CHECK_COOLDOWN_MS) {
      // Already found this invalid moments ago -- skip straight to the
      // self-heal instead of firing another GET /auth/getprofile.
      this.coreService.logout();
      return true;
    }

    const userRole = await this.coreService.getRole();
    try {
      await this.coreService.verifySession().toPromise();
      // Verified current session -- the existing authenticated-redirect
      // behavior is unchanged.
      this.navigateToUserRole(userRole);
      return false;
    } catch (_) {
      // Stale/invalid -- self-heal through the existing canonical cleanup
      // (never a parallel mechanism; preserves this owner's AI recovery,
      // same as every other logout() caller), then let the auth page
      // render normally instead of leaving the optimistic redirect in place.
      this.lastInvalidCheckAt = Date.now();
      this.coreService.logout();
      return true;
    }
  }

  navigateToUserRole(role) {
    switch (role) {
      case '1':
        this.router.navigateByUrl('/admin');
        return true;
      case '2':
        console.log('eto');
        this.router.navigateByUrl('/recruiter');
        return true;
      case '3':
        this.router.navigateByUrl('/user');
        return true;
      default:
        return false;
    }
  }
}
