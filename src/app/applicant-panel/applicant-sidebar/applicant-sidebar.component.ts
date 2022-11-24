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
  @Input() fullName;

  private req: Subscription;


  public location: any = '';
  public loggedUserData: any = JSON.parse(localStorage.getItem('userData'));
  public screenHeight: number = 300;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.req = this.router.events.subscribe((event: any) => {
      this.location = this.router.url;
      this.loggedUserData = JSON.parse(localStorage.getItem('userData'));
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

    // {
    //   title: 'Jobs Opening', icon: 'jobs.png', class: 'jobs', route: 'jobs'
    // },

    // {
    //   title: 'Inbox', icon: 'applicants.png', class: 'inbox', route: 'inbox'
    // },

    {
      title: 'Profile', icon: 'account.png', class: 'profile', route: 'profile/details'
    },

    {
      title: 'Settings', icon: 'expired-jobs.png', class: 'expired', route: 'settings'
    },
  ]

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenHeight = window.innerHeight;
  }

  ngOnInit(): void {
    this.location = this.router.url;
    this.screenHeight = window.innerHeight;
  }

  ngOnDestroy(): void {
    if (this.req) this.req.unsubscribe();
  }

  changeRoute(route) {
    console.log(route);
    this.router.navigate([route]);
  }
}
