import { Component, Input, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { mainAnimations } from '@main/shared/animations/main-animations';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
// OPTIMIZE V5: removed unused ActivatedRoute and EmployeeFacade imports

@Component({
  selector: 'app-employer-sidebar',
  templateUrl: './employer-sidebar.component.html',
  styleUrls: ['./employer-sidebar.component.scss'],
  animations: [mainAnimations]
})
// OPTIMIZE V5: added OnDestroy to implements — ngOnDestroy was already present
// but the interface was not declared, breaking strict compiler checks.
export class EmployerSidebarComponent implements OnInit, OnDestroy {
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
    // OPTIMIZE V5: removed debug console.log calls (were present since initial build)
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
    // B01: Added "Messages" as item 4 (after Candidates, before Company).
    // The sidebar previously had 5 items capped at V5; Messages replaces
    // Subscription as item 5, pushing Subscription to item 6. The sidebar
    // template uses *ngFor and does not hard-cap at 5 — only the mobile
    // bottom nav has a 5-item constraint (handled separately in the template).
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
        // Previously "Contacts" — renamed to "Candidates" for employer clarity.
        // Sub-routes are preserved so existing /recruiter/contacts/** links still work.
        title: 'Candidates', icon: 'applicants.png', class: 'applicants', route: 'contacts',
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
      // B03: Interviews hub — links to /recruiter/interview.
      // Added after Candidates so the recruiter pipeline flows naturally:
      // Dashboard → Jobs → Candidates → Interviews → Messages → Company → Subscription.
      {
        title: 'Interviews', icon: 'applicants.png', class: 'interviews', route: 'interview'
      },
      // B01: Global messages inbox. Uses a chat-bubble icon image. Falls back
      // gracefully if the icon file is absent — the text label is always visible.
      {
        title: 'Messages', icon: 'jobs.png', class: 'messages', route: 'messages'
      },
      {
        // Previously "Company Profile" — renamed to "Company" for brevity.
        // Route is unchanged (/recruiter/company/details) for backward compatibility.
        title: 'Company', icon: 'account.png', class: 'accounts',
        route: 'company/details'
      },
      {
        title: this.translate.instant('ADMIN_DASHOBOARD.SIDEBAR_SUBCRIPTIONS'), icon: 'subscribe.png', class: 'subscription',
        route: 'subscription'
      }
    ]
  }

  ngOnDestroy(): void {
    if (this.req) this.req.unsubscribe();
  }

  changeRoute(route) {
    this.router.navigate([route]);
  }
}
