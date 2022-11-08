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
    const featureRoutes: Routes = [
      {
        path: 'admin',
        loadChildren: () => import('@main/admin-panel/admin-panel.module').then(m => m.AdminPanelModule),
        data: { name: "admin" }
      },
      {
        path: '',
        loadChildren: () => import('@main/employer-panel/employer-panel.module').then(m => m.EmployerPanelModule),
        data: { name: "employer" }
      },
    ];

    const applicantRoutes: Routes = [
      {
        path: '',
        loadChildren: async () =>
          import('@main/applicant-panel/applicant-panel.module').then(m => m.ApplicantPanelModule),
        canActivate: [AuthGuard],
        data: { name: "applicant" }
      }
    ]

    const authRoutes: Routes = [
      {
        path: '',
        loadChildren: () => import('@main/auth/auth.module').then(m => m.AuthModule),
        data: { name: "auth" }
      }
    ]

    const logged = await this.asyncLocalStorage.getItem('state');
    if (logged != 'true') {
      this.router.resetConfig([
        ...authRoutes
      ]);
      this.router.navigateByUrl('/signin');
    }
    this.router.resetConfig([
      ...featureRoutes
    ]);
    return logged == 'true';
  }

}
