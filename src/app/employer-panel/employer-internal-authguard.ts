import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router, UrlSegment, Route, CanActivateChild, CanDeactivate, CanLoad, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EmployeeFacade } from '@main/employee/state/employee.facade';
import { CompanyNotSetupComponent } from '@main/company/company-not-setup/company-not-setup.component';
import { MatDialog } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})
export class InternalEmployerGuard implements CanActivate, CanActivateChild, CanDeactivate<unknown>, CanLoad {

  withCompany: boolean;

  company$ = this.employeeFacade.company$
    .pipe().subscribe(this.checkUserLogin.bind(this));

  constructor(
    private employeeFacade: EmployeeFacade,
    private dialog: MatDialog,
    private router: Router
  ) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    let url: string = state.url;
    // return (this.checkUserLogin(next, url) && this.checkScreenSize());
    return this.withCompany;
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
    return this.withCompany;
  }

  checkUserLogin(company) {
    if (!company || company.length == 0) {
      this.withCompany = false;
      const noCompany = this.dialog.open(CompanyNotSetupComponent, {
        width: '50vw',
      });

      noCompany.afterClosed().subscribe(res => {
        this.router.navigateByUrl('/company/settings');
      })
    } else {
      this.withCompany = true;
    }
  }
}
