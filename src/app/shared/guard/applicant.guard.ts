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

    console.log(url);
    console.log(this.router.config);
    console.log(logged);

    if (logged != 'true') {
      console.log('HOY Login!');
      this.router.resetConfig([
        ...authRoutes
      ]);
      return false;
    } else {
      if(role != '3') {
        console.log('Ligaw');
        this.router.resetConfig([
          ...adminRoutes,
          ...employerRoutes
        ]);
        return false;
      } else {
        console.log('dito b? baka');

        return true
      }
    }
  }

}
