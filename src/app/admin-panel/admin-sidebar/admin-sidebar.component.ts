import { Component, HostListener, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { Subscription } from 'rxjs';

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

  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.req = this.router.events.subscribe((event: any) => {
      this.location = this.router.url;
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    });
  }

  public sidebarItems: any[] = [
    {
      title: 'Dashboard', icon: 'dashboard.png', class: 'dashboard', route: 'dashboard'
    },
    {
      title: 'Users', icon: 'jobs.png', class: 'jobs', route: 'users'
    }
  ]

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenHeight = window.innerHeight;
  }

  ngOnInit(): void {
    this.location = this.router.url;
    this.screenHeight = window.innerHeight;
    if(this.user) {
      this.initials = this.user.firstName.charAt(0).toUpperCase() + ' ' + this.user.lastName.charAt(0).toUpperCase();
    }
  }

  ngOnDestroy(): void {
    if (this.req) this.req.unsubscribe();
  }

  changeRoute(route) {
    console.log(route);
    this.router.navigate([route]);
  }

}
