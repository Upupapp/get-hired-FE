import { Component, HostListener, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-applicant-sidebar',
  templateUrl: './applicant-sidebar.component.html',
  styleUrls: ['./applicant-sidebar.component.scss'],
  animations: [mainAnimations]
})
export class ApplicantSidebarComponent implements OnInit {
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
      title: 'Dashboard', icon: 'dashboard.png', class: 'dashboard', route: 'dashboard', active: 'dashboard-blk.png'
    },

    // {
    //   title: 'Jobs Opening', icon: 'jobs.png', class: 'jobs', route: 'jobs'
    // },

    // {
    //   title: 'Inbox', icon: 'applicants.png', class: 'inbox', route: 'inbox'
    // },

    {
      title: 'Profile', icon: 'jobs.png', class: 'expired', route: 'profile/details', active: 'jobs-blk.png'
    },

    {
      title: 'Settings', icon: 'account.png', class: 'profile', route: 'settings', active: 'account-blk.png'
    },
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
