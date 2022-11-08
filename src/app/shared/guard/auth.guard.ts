import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router, UrlSegment, Route, CanActivateChild, CanDeactivate, CanLoad, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { CoreService } from '@app-core/services/core.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild, CanDeactivate<unknown>, CanLoad {

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
    return (this.checkUserLogin(next, url));
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

  checkUserLogin(route?: ActivatedRouteSnapshot, url?: any): boolean {
    const checkUrl = this.authRedirection(url);

    if (checkUrl == 'true') {
      console.log('regular');
      return true;
    } else {
      this.router.navigateByUrl(checkUrl);
      return false;
    }
  }

  authRedirection(url: string) {
    this.addRoleBasedRoute();

    const isLoggedIn = this.coreService.isLoggedIn();

    switch (url) {
      case '/signup':
        return isLoggedIn ? '/dashboard' : this.removeRouteNotAuth(url);
      case '/reset-password':
        return isLoggedIn ? '/dashboard' : this.removeRouteNotAuth(url);
      case '/change-password':
        return isLoggedIn ? '/dashboard' : this.removeRouteNotAuth(url);
      case '/verify':
        return isLoggedIn ? '/dashboard' : this.removeRouteNotAuth(url);
      case '/signin':
        return isLoggedIn ? '/dashboard' : this.removeRouteNotAuth('true');
      default:
        if (url != '/signin' && !isLoggedIn) {
          // if (!isLoggedIn) {
          this.snackBar.open(`(AuthGuard) You are not Authorized to access that page. Please Login first`, '', { duration: 4000, panelClass: ['danger-snackbar'] });
          return '/signin';
        }
        return 'true';
    }
  }

  async addRoleBasedRoute() {
    console.log(this.router.config);

    const c = this.router.config.findIndex(x => x.data.name == 'employer');
    const h = this.router.config.findIndex(x => x.data.name == 'applicant');
    const isLoggedIn = this.coreService.isLoggedIn();
    const role = await this.coreService.getRole();

    console.log(c);
    console.log(h);
    console.log(isLoggedIn);


    if (isLoggedIn && role == '2' && c == -1) {
      const employerRoute = {
        path: '',
        loadChildren: () => import('@main/employer-panel/employer-panel.module').then(m => m.EmployerPanelModule),
        canActivate: [AuthGuard],
        data: { name: "employer" }
      }
      this.router.config.splice(1, 0, employerRoute);
    } else if (isLoggedIn && role == '3' && h == -1) {
      const applicantRoute = {
        path: '',
        loadChildren: async () =>
          import('@main/applicant-panel/applicant-panel.module').then(m => m.ApplicantPanelModule),
        canActivate: [AuthGuard],
        data: { name: "applicant" }
      };

      this.router.config.splice(1, 0, applicantRoute);
    }
  }

  removeRouteNotAuth(url) {
    const c = this.router.config.findIndex(x => x.data.name == 'employer');
    this.router.config.splice(c, 1);

    const h = this.router.config.findIndex(x => x.data.name == 'applicant');
    this.router.config.splice(h, 1);

    console.log(this.router.config);
    return url;
  }

}
