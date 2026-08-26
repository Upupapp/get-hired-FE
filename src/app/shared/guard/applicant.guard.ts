import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router, UrlSegment, Route, CanActivateChild, CanDeactivate, CanLoad, ActivatedRoute, Routes } from '@angular/router';
import { Observable, of } from 'rxjs';
import { CoreService } from '@app-core/services/core.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { adminRoutes, applicantRoutes, authRoutes, employerRoutes } from './routes';

@Injectable({
  providedIn: 'root'
})
export class ApplicantGuard implements CanActivate, CanActivateChild, CanDeactivate<unknown>, CanLoad {
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
    private coreService: CoreService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private activatedRoute: ActivatedRoute
  ) { }

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
    const role = await this.asyncLocalStorage.getItem('role');

    if (logged != 'true') {
      this.router.resetConfig([
        ...authRoutes
      ]);
      // BUGFIX: resetConfig alone does not re-navigate -- the in-flight
      // navigation to the blocked applicant-only URL (e.g. /user/applications)
      // is simply cancelled by returning false below, leaving the user on a
      // blank/stuck page instead of landing on sign-in. EmployerGuard's
      // equivalent branch already calls navigateByUrl(url) here to force
      // Angular to re-resolve the now-blocked URL against the freshly reset
      // authRoutes table (whose wildcard route loads the auth module) --
      // this branch was missing that call.
      this.router.navigateByUrl(url);
      return false;
    } else {
      if(role != '3') {
        this.router.resetConfig([
          ...adminRoutes,
          ...employerRoutes
        ]);
        return false;
      } else {
        return true
      }
    }
  }

}
