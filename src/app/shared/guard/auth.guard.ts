import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router, UrlSegment, Route, CanActivateChild, CanDeactivate, CanLoad, ActivatedRoute, Routes } from '@angular/router';
import { Observable, of } from 'rxjs';
import { CoreService } from '@app-core/services/core.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { rememberReturnUrl } from '../utils/auth-return-url.util';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild, CanDeactivate<unknown>, CanLoad {
  asyncLocalStorage = {
    setItem: async function (key, value) {
      await Promise.resolve();
      localStorage.setItem(key, value);
    },
    getItem: async function (key) {
      await Promise.resolve();
      return localStorage.getItem(key);
    }
  };

  constructor(
    private coreService: CoreService,
    private router: Router,
    private snackBar: MatSnackBar,
    private activatedRoute: ActivatedRoute
  ) {}

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
    return true;
  }

  async checkUserLogin(route?: ActivatedRouteSnapshot, url?: any): Promise<boolean> {
    const logged = await this.asyncLocalStorage.getItem('state');
    const token = await this.asyncLocalStorage.getItem('token');

    if (logged == 'true' && !!token) {
      const userRole = await this.coreService.getRole();
      if (route.data.role && route.data.role.indexOf(userRole) === -1) {
        // Wrong role: redirect to the correct panel and deny access to this route.
        // Previously returned true here, which let a wrong-role user past the guard.
        this.snackBar.open(`You don't have access to that area. Redirecting you now.`,
          '', { duration: 3000, panelClass: ['danger-snackbar'] });
        this.navigateToUserRole(userRole);
        return false;
      }
      return true;
    } else {
      // A protected route must require both halves of the local session.
      // `state=true` without a token, or a leftover token with state=false,
      // is an interrupted/expired session. Clear it before loading Sign in
      // so stale credentials cannot be attached to guest requests.
      if (logged == 'true' || !!token) {
        this.coreService.discardExpiredSession();
      }
      const expectedRole = route && route.data ? Number(route.data.role) : null;
      if ((expectedRole === 2 || expectedRole === 3) && url) {
        rememberReturnUrl(url, expectedRole);
      }
      this.snackBar.open(`You are not Authorized to access that page. Please Login first`,
        '', { duration: 4000, panelClass: ['danger-snackbar'] });
      this.router.navigate(['/signin'], {
        queryParams: expectedRole === 2 || expectedRole === 3 ? { role: expectedRole } : undefined,
      });
      return false;
    }
  }

  navigateToUserRole(role) {
    switch (role) {
      case '1':
        this.router.navigateByUrl('/admin/dashboard');
        return true;
      case '2':
        this.router.navigateByUrl('/recruiter/dashboard');
        return true;
      case '3':
        this.router.navigateByUrl('/user/dashboard');
        return true;
      default:
        return false;
    }
  }

}
