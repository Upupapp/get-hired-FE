import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router, UrlSegment, Route, CanActivateChild, CanDeactivate, CanLoad, ActivatedRoute, Routes } from '@angular/router';
import { Observable, of } from 'rxjs';
import { CoreService } from '@app-core/services/core.service';
import { MatSnackBar } from '@angular/material/snack-bar';

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
    private route: ActivatedRoute,
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
    return this.checkUserLogin();
  }

  async checkUserLogin(route?: ActivatedRouteSnapshot, url?: any): Promise<boolean> {
    const logged = await this.asyncLocalStorage.getItem('state');
    if (logged == 'true') {
      const userRole = await this.coreService.getRole();
      if (route.data.role && route.data.role.indexOf(userRole) === -1) {
        this.navigateToUserRole(userRole);
      }
      return true;
    }
    this.snackBar.open(`You are not Authorized to access that page. Please Login first`,
              '', { duration: 4000, panelClass: ['danger-snackbar'] });
    this.router.navigateByUrl('/signin');
    return false;
  }

  navigateToUserRole(role) {
    switch (role) {
      case '1':
        this.router.navigateByUrl('/admin');
        return true;
      case '2':
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
