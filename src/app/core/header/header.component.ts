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
  userRole = localStorage.getItem('role');
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

  navigateToLink(){
    this.router.navigate(['/jobs'])
  }

  redirectToRegister() {
    this.router.navigateByUrl('/signin');
  }

  goToDashboard() {
    switch (this.userRole) {
      case '1':
        this.router.navigateByUrl('/admin/dashboard');
        break;
      case '2':
        this.router.navigateByUrl('/recruiter/dashboard');
        break;
      case '3':
        this.router.navigateByUrl('/user/dashboard');
        break;
    }
  }

  logout() {
    localStorage.clear();
    this.appFacade.resetCredentials();
    this.router.navigateByUrl('/signin');
  }
}
