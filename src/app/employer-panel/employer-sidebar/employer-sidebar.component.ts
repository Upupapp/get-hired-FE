import { Component, Input, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeeFacade } from '@main/employee/state/employee.facade';
import { mainAnimations } from '@main/shared/animations/main-animations';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-employer-sidebar',
  templateUrl: './employer-sidebar.component.html',
  styleUrls: ['./employer-sidebar.component.scss'],
  animations: [mainAnimations]
})
export class EmployerSidebarComponent implements OnInit {
  private req: Subscription;
  @Input() sidebarWidth;
  @Input() user;
  companyName: string;
  withActiveSubscription = localStorage.getItem('withActiveSubscription');
  public location: any = '';
  public screenHeight: number = 300;
  sidebarItems: any[];

  constructor(
    private router: Router,
    private translate: TranslateService
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

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenHeight = window.innerHeight;
  }

  ngOnInit(): void {
    this.location = this.router.url;
    this.screenHeight = window.innerHeight;
    console.log('Secret')
    console.log(this.user);
  }

  subRouteActive(route) {
    if (route.match('jobs') && this.location.match('jobs')
      && !route.match('expired') && this.location !== '/recruiter/jobs/expired') {
      return true;
    }

    else if (this.location === '/recruiter/jobs/expired' && route.match('expired')) {
      return true;
    }

    else if (this.location === '/recruiter/' + route && !this.location.match('expired')) {
      return true
    }

    else return false;
  }

  ngOnChanges(changes) {
    this.sidebarItems = [
      {
        title: 'Dashboard', icon: 'dashboard.png', class: 'dashboard', route: 'dashboard'
      },
      {
        title: 'Jobs', icon: 'jobs.png', class: 'jobs',
        route: 'jobs',
        sub_routes: [
          {
            title: this.translate.instant('JOB_POSTS_PAGE.SIDEBAR_JOB_POSTS'), icon: 'jobs.png', class: 'jobs', route: 'jobs/list',
          },
          {
            title: this.translate.instant('JOB_POSTS_PAGE.SIDEBAR_EXPIRED_JOBS'), icon: 'expired-jobs.png', class: 'expired', route: 'jobs/expired'
          },
        ]
      },
      {
        title: this.translate.instant('ADMIN_DASHOBOARD.SIDEBAR_CONTACTS'), icon: 'applicants.png', class: 'applicants', route: 'contacts',
        sub_routes: [
          {
            title: 'Contact List', icon: 'contact-list.png', class: 'contact-list', route: 'contacts/list'
          },
          {
            title: 'Contact Group', icon: 'applicants.png', class: 'applicants', route: 'contacts/groups',
          },
          {
            title: this.translate.instant('CONTACTS_CANDIDATES.SIDEBAR_CANDIDATE'), icon: 'applicants.png', class: 'applicants', route: 'contacts/candidates',
          },

        ]
      },
      {
        title: this.translate.instant('ADMIN_DASHOBOARD.SIDEBAR_INTERVIEWS'), icon: 'create-interview.png', class: 'interviews', route: 'interview',
        sub_routes: [
          {
            title: "Interview List", icon: 'create-interview.png', class: 'interviews', route: 'interview/list',
          },
          {
            title: "Question Templates", icon: 'create-interview.png', class: 'interviews', route: 'interview/templates'
          },
        ]
      },
      {
        title: this.translate.instant('ADMIN_DASHOBOARD.SIDEBAR_SUBCRIPTIONS'), icon: 'subscribe.png', class: 'subscription',
        route: 'subscription'
      },
      {
        title: this.translate.instant('ADMIN_DASHOBOARD.SIDEBAR_EMPLOYER_BRANDING'), icon: 'account.png', class: 'accounts',
        route: 'company/details'
      }
    ]
  }

  ngOnDestroy(): void {
    if (this.req) this.req.unsubscribe();
  }

  changeRoute(route) {
    console.log(route);
    this.router.navigate([route]);
  }
}
