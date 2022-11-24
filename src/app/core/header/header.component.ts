import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppFacade } from '@main/state/app.facade';
import { CoreService } from '../services/core.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Input() user: any;
  @Input() isUserLoggedIn: boolean;
  @Input() isPublic: boolean;

  initials: string;

  constructor(
    private coreService: CoreService,
    private router: Router,
    private appFacade: AppFacade
  ) {
  }

  ngOnInit(): void {
    console.log(this.isUserLoggedIn);
    if (this.user) {
      this.initials = this.user.firstName.charAt(0).toUpperCase() + ' ' + this.user.lastName.charAt(0).toUpperCase();
    }
  }

  redirectToRegister() {
    this.router.navigateByUrl('/signin');
  }

  logout() {
    localStorage.clear();
    this.appFacade.resetCredentials();
    this.router.navigateByUrl('/signin');
    // this.coreService.logout().pipe().subscribe(isLogout => {
    //   console.log(isLogout);
    //   if(isLogout.success) {

    //   }
    // });
  }
}
