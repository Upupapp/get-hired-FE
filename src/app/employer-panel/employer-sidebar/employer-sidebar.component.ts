import { Component, Input, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { mainAnimations } from '@main/shared/animations/main-animations';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription, interval } from 'rxjs';
import { map } from 'rxjs/operators';
import { CompanyFacade } from '@main/company/state/company.facade';
import { MessageService } from '@app-shared/services/message.service';

@Component({
  selector: 'app-employer-sidebar',
  templateUrl: './employer-sidebar.component.html',
  styleUrls: ['./employer-sidebar.component.scss'],
  animations: [mainAnimations]
})
export class EmployerSidebarComponent implements OnInit, OnDestroy {
  private req: Subscription;
  @Input() sidebarWidth;
  @Input() user;
  companyName$: Observable<string>;
  companyLogoUrl$: Observable<string>;
  withActiveSubscription = localStorage.getItem('withActiveSubscription');
  public location: any = '';
  public screenHeight: number = 300;
  sidebarItems: any[];
  private collapsedRoutes = new Set<string>();

  // Messages sidebar badge -- same lightweight unread-count endpoint the
  // Messages tab uses. No websocket/push infra exists in this codebase,
  // so this can't be truly push-driven -- but authenticated requests
  // bypass the rate limiter entirely (server.js's globalLimiter skip
  // check), so there's no cost reason to poll as slowly as the header
  // notification bell's 45s does. Tightened to 10s (a "feels real-time"
  // cadence) plus an immediate refresh on window focus/tab visibility
  // return, so the badge updates right away when the employer switches
  // back to this tab instead of waiting out the interval.
  unreadMessageCount = 0;
  private unreadPollSub: Subscription;
  private unreadChangeSub: Subscription;
  private static readonly UNREAD_POLL_INTERVAL_MS = 10000;
  private onVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      this.refreshUnreadCount();
    }
  };

  constructor(
    private router: Router,
    private translate: TranslateService,
    private companyFacade: CompanyFacade,
    private messageService: MessageService
  ) {
    this.req = this.router.events.subscribe((event: any) => {
      this.location = this.router.url;
      // Auto-expand any parent whose child route is now active
      this.collapsedRoutes.forEach(route => {
        if (this.router.url.includes(route)) {
          this.collapsedRoutes.delete(route);
        }
      });
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
    this.companyName$ = this.companyFacade.companyDetails$.pipe(
      map(company => (company && company.companyName) ? company.companyName : (this.user && this.user.companyName ? this.user.companyName : ''))
    );
    this.companyLogoUrl$ = this.companyFacade.companyDetails$.pipe(
      map(company => (company && company.companyLogoUrl) ? company.companyLogoUrl : '')
    );
    this.refreshUnreadCount();
    this.unreadPollSub = interval(EmployerSidebarComponent.UNREAD_POLL_INTERVAL_MS).subscribe(() => {
      this.refreshUnreadCount();
    });
    document.addEventListener('visibilitychange', this.onVisibilityChange);
    // Instant update the moment a thread is marked read on the Messages
    // page itself, rather than waiting out the poll interval.
    this.unreadChangeSub = this.messageService.unreadCountChanged$.subscribe(() => {
      this.refreshUnreadCount();
    });
  }

  private refreshUnreadCount(): void {
    this.messageService.getUnreadCount().subscribe({
      next: (count) => { this.unreadMessageCount = count || 0; },
      error: () => { /* non-fatal -- badge just stays at its last-known state */ },
    });
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
        // BUGFIX (parent/child naming collision -- confirmed via audit):
        // was "Contacts", then "Candidates" for employer clarity, but its
        // own child route at contacts/candidates is ALSO titled
        // "Candidates" (CONTACTS_CANDIDATES.SIDEBAR_CANDIDATE below), so
        // the sidebar read "Candidates > Candidates" with no way to tell
        // that child apart from "Contact List"/"Contact Group" without
        // opening each one. "Talent" covers what this section actually is
        // -- job applicants (contacts/candidates, real ApplicantModel/
        // job_id data per candidate-list.component.ts), general contacts
        // (contacts/list -- itself already titled "Contacts" on-page, per
        // contact-list.component.html's componentTitle, so this also fixes
        // a pre-existing sidebar/page-title mismatch), and saved contact
        // groupings (contacts/groups) -- without colliding with any one of
        // them. Sub-routes/URLs unchanged so existing /recruiter/
        // contacts/** links and deep links still work.
        // TALENT-WORKSPACE-REDESIGN: "Contacts"/"Contact Groups" reframed as
        // "Talent Pool"/"Candidate Groups" -- routes unchanged (still
        // contacts/list, contacts/groups) so existing deep links keep
        // working; only the user-facing labels changed, matching the
        // on-page titles updated in the same pass.
        title: 'Talent', icon: 'applicants.png', class: 'applicants', route: 'contacts',
        sub_routes: [
          {
            title: 'Talent Pool', icon: 'contact-list.png', class: 'contact-list', route: 'contacts/list'
          },
          {
            title: 'Candidate Groups', icon: 'applicants.png', class: 'applicants', route: 'contacts/groups',
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
        title: 'Company', icon: 'account.png', class: 'accounts',
        route: 'company/settings'
      },
      {
        title: this.translate.instant('ADMIN_DASHOBOARD.SIDEBAR_SUBCRIPTIONS'), icon: 'subscribe.png', class: 'subscription',
        route: 'subscription'
      }
    ]
  }

  ngOnDestroy(): void {
    if (this.req) this.req.unsubscribe();
    if (this.unreadPollSub) this.unreadPollSub.unsubscribe();
    if (this.unreadChangeSub) this.unreadChangeSub.unsubscribe();
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
  }

  isSubnavOpen(route: string): boolean {
    return !!this.location?.match(route) && !this.collapsedRoutes.has(route);
  }

  toggleCollapse(event: MouseEvent, route: string): void {
    event.stopPropagation();
    if (this.collapsedRoutes.has(route)) {
      this.collapsedRoutes.delete(route);
    } else {
      this.collapsedRoutes.add(route);
    }
  }

  changeRoute(route) {
    this.router.navigate([route]);
  }
}
