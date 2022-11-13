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

  constructor(
    private coreService: CoreService,
    private router: Router,
  ) {
  }

  ngOnInit(): void {
    console.log(this.isUserLoggedIn);
    this.initials = this.user.firstName.charAt(0).toUpperCase() + ' ' + this.user.lastName.charAt(0).toUpperCase();
  }

  redirectToRegister() {
    this.router.navigateByUrl('/signup');
  }

  logout() {
    this.coreService.logout().subscribe(isLogout => {
      console.log(isLogout);
      if(isLogout.success) {
        localStorage.clear();
        this.router.navigateByUrl('/signin');
      }
    });
  }
}
