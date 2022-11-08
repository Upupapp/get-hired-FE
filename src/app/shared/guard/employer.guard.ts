import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router, UrlSegment, Route, CanActivateChild, CanDeactivate, CanLoad, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { CoreService } from '@app-core/services/core.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class EmployerGuard implements CanActivate, CanActivateChild, CanDeactivate<unknown>, CanLoad {


  constructor(
    private coreService: CoreService,
    private router: Router,
    private snackBar: MatSnackBar,
    private activatedRoute: ActivatedRoute
  ) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    let url: string = state.url;
    // return (this.checkUserLogin(next, url) && this.checkScreenSize());
    return (this.checkUserLogin());
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

  async checkUserLogin(): Promise<boolean> {
    const role = await this.getLoggedRole();
    console.log(role);
    const i = this.router.config.findIndex(x => x.data.name == 'employer');

    if (role) {
      switch (role) {
        case '1':
          this.router.navigateByUrl('/admin');
          return false;
        case '2':
          console.log('case2 in employer guard')
          return true;
        case '3':
          console.log('case3 in employer guard')
          this.router.config.splice(i, 1);
          this.router.navigate(['../dashboard']);
          return false;
      }
    } else {
      this.router.navigateByUrl('/signin');
      return false;
    }
  }

  async getLoggedRole() {
    return await this.coreService.getRole();
  }

  // TODO for mobile screen
  // checkScreenSize() {
  //   const height = window.screen.availHeight;
  //   const width = window.screen.availWidth;
  //   const userRole = this.coreService.getRole();

  //   if(width < 1025 && userRole == '3') {
  //     window.location.href = 'https://app.gwana.app/show-mobile-app';
  //   } else if (width < 1025 && userRole == '1') {
  //     this.router.navigateByUrl('/error/invalid-screen');
  //   } else {
  //     return true;
  //   }
  // }

}
