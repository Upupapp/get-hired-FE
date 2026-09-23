import { Component, HostListener, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { Subscription } from 'rxjs';
import { ADMIN_NAV } from '../admin-nav';

@Component({
  selector: 'app-admin-sidebar',
  templateUrl: './admin-sidebar.component.html',
  styleUrls: ['./admin-sidebar.component.scss'],
  animations: [mainAnimations]
})
export class AdminSidebarComponent implements OnInit {
  @Input() sidebarWidth;
  @Input() user;

  private req: Subscription;


  public location: any = '';
  public screenHeight: number = 300;
  initials: string;
  public sidebarItems = ADMIN_NAV;

  constructor(
    private router: Router,
  ) {
    this.req = this.router.events.subscribe(() => {
      this.location = this.router.url;
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenHeight = window.innerHeight;
  }

  ngOnInit(): void {
    this.location = this.router.url;
    this.screenHeight = window.innerHeight;
    const firstName = this.user && this.user.firstName;
    const lastName = this.user && this.user.lastName;
    if (firstName && lastName) {
      this.initials = firstName.charAt(0).toUpperCase() + ' ' + lastName.charAt(0).toUpperCase();
    }
  }

  ngOnDestroy(): void {
    if (this.req) this.req.unsubscribe();
  }

}
