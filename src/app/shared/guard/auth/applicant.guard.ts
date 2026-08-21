import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AdminService } from '../../services/auth/admin/admin.service';
import { Router, ActivatedRoute } from '@angular/router';
import { map, delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApplicantGuard implements CanActivate {
  constructor(private adminService: AdminService, private router: Router){}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    return this.adminService.getRefreshToken()
    .pipe(map((result:any) => {
      let token =  JSON.parse(JSON.stringify(result)).refreshToken
      let userData = JSON.parse(localStorage.getItem('userData'));

      if(token && userData?.applicant){
        localStorage.setItem('refreshTokenMessage', 'Refresh Token was successful.');
        localStorage.setItem('token', 'Bearer ' + JSON.parse(JSON.stringify(result)).refreshToken);
        return true;
      }
      else if(userData?.employer) {
        localStorage.setItem('loginError', "You are not allowed to access this URL. Please login to continue.");
        // localStorage.setItem('returnURL', this.router.url);
        this.adminService.logoutAdmin().subscribe((res: any) => res);
        this.router.navigate(['/signin']);
        return false;
      }
      else {
        // PROFILE-SETUP PHASE 1 FIX (confirmed latent edge, §17): previously
        // fell through with no explicit return here -- userData with
        // neither .applicant nor .employer (malformed/unresolved role
        // state, e.g. no refresh token yet, corrupted localStorage, or a
        // brand-new session mid-establishment) resolved to `undefined`,
        // which Angular's CanActivate treats as falsy (denies navigation)
        // but with no redirect/message -- a silent block rather than a
        // clean fail-closed. Made explicit: deny and redirect to sign-in,
        // matching the employer-role-denial branch immediately above.
        this.router.navigate(['/signin']);
        return false;
      }
    }));
  }

}
