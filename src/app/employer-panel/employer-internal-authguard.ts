import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router, UrlSegment, Route, CanActivateChild, CanDeactivate, CanLoad, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EmployeeFacade } from '@main/employee/state/employee.facade';
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
    private router: Router,
    private route: ActivatedRoute
  ) {
    const uid = JSON.parse(localStorage.getItem('user'))._id;
    this.employeeFacade.getEmployeeCompany(uid);
  }

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
    console.log(company);
    if (!company || company.length == 0) {
      this.withCompany = false;
      this.router.navigateByUrl('/recruiter/company')
    } else {
      this.withCompany = true;
    }
  }
}
