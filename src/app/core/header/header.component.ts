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
  fullName: string;
  @Input() isUserLoggedIn: boolean;

  constructor(
    private coreService: CoreService,
    private router: Router,
  ) {
  }

  ngOnInit(): void {
    console.log(this.isUserLoggedIn);
    // this.fullName = this.user.firstName + ' ' + this.user.lastName;
  }

  redirectToRegister() {
    this.router.navigateByUrl('/signup');
  }

  logout() {
    this.coreService.logout().subscribe(isLogout => {
      if(isLogout.success) {
        // this.authFacade.logout();
        // this.router.navigateByUrl('/signin');
      }
    });
  }
}
