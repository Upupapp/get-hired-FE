import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router, UrlSegment, Route, CanActivateChild, CanDeactivate, CanLoad, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { CoreService } from '@app-core/services/core.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate, CanActivateChild, CanDeactivate<unknown>, CanLoad {


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

  checkUserLogin(): boolean {
    const role = this.coreService.getRole();
    console.log(role);

    if (role) {
      if(role != '1') {
        this.router.navigateByUrl('/dashboard');
        return false;
      }
      return true;
    } else {
      this.router.navigateByUrl('/signin');
      return false;
    }
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
