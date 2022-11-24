import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthFacade } from '@main/auth/state/auth.facade';
import { CoreService } from '../services/core.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Input() user: any;
  initials: string;
  @Input() isUserLoggedIn: boolean;
  @Input() isPublic: boolean;

  constructor(
    private coreService: CoreService,
    private router: Router,
    private authFacade: AuthFacade
  ) {
  }

  ngOnInit(): void {
    console.log(this.isUserLoggedIn);
    if(this.user) {
      this.initials = this.user.firstName.charAt(0).toUpperCase() + ' ' + this.user.lastName.charAt(0).toUpperCase();
    }
  }

  redirectToRegister() {
    this.router.navigateByUrl('/signin');
  }

  logout() {
    this.coreService.logout().pipe().subscribe(isLogout => {
      console.log(isLogout);
      if(isLogout.success) {
        this.authFacade.logout();
        localStorage.clear();
        this.router.navigateByUrl('/signin');
      }
    });
  }
}
