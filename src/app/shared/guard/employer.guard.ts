import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router, UrlSegment, Route, CanActivateChild, CanDeactivate, CanLoad, ActivatedRoute, Routes } from '@angular/router';
import { Observable, of } from 'rxjs';
import { CoreService } from '@app-core/services/core.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { adminRoutes, applicantRoutes, authRoutes, employerRoutes } from './routes';
import { routes } from '@main/app.routing.module';

@Injectable({
  providedIn: 'root'
})
export class EmployerGuard implements CanActivate, CanActivateChild, CanDeactivate<unknown>, CanLoad {
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
    const isAuthRoute = this.isAuthPath(location.pathname);
    console.log(location.pathname);
    console.log(this.router.config);
    console.log(logged);
    console.log(isAuthRoute);

    if (logged != 'true') {
      console.log('HOY Login!');
      this.router.resetConfig([
        ...authRoutes
      ]);
      this.router.navigateByUrl(url);
      return false;
    } else {
      if(role != '2') {
        console.log('Ligaw');
        this.router.resetConfig([
          ...adminRoutes,
          ...applicantRoutes
        ]);
        return false;
      } else {
        // if(isAuthRoute) {
        //   console.log(this.router.config)
        //   console.log(url);
        //   this.router.resetConfig([
        //     ...employerRoutes
        //   ]);
        //   this.router.navigate(['./dashboard']);
        //   return true;
        // } else
        if(url == '/' || isAuthRoute) {
          console.log('talaga ba?')
          this.router.navigate(['./dashboard']);
          this.router.resetConfig([
            ...employerRoutes
          ]);
          return false;
        } else {
          console.log('mali')
          console.log(this.router.config);

          console.log(url);
          this.router.resetConfig(routes);
          return true;
        }
      }
    }
  }

  isAuthPath(url: string) {
    return [
      '/signin',
      '/signup',
      '/reset-password',
      '/change-password',
      '/verify'
    ].includes(url);
  }

}
