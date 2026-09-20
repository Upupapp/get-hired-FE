import {
  Component,
  OnInit,
  Output,
  Input,
  EventEmitter,
  ViewChild,
  ElementRef,
  HostListener,
  AfterViewInit,
  OnDestroy
} from '@angular/core';
import {
  Router,
  ActivatedRoute
} from '@angular/router';
import { AppFacade } from '@main/state/app.facade';
import { CoreService } from '../services/core.service';
import { Observable, Subscription, interval } from 'rxjs';
import { map } from 'rxjs/operators';
import { NotificationService, AppNotification } from '@main/shared/services/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { SubscriptionEngagementService } from '@main/shared/engagement/subscription-engagement.service';
import { CtaAction } from '@main/shared/engagement/engagement-contract.models';
import { navigatesAfterClick, priorityPresentation } from '@main/shared/engagement/engagement-message.presentation';
import { ConfirmationDialogComponent } from '@app-shared/components/confirmation-dialog/confirmation-dialog.component';
import { EngagementRefreshBus } from '@main/shared/engagement/engagement-refresh.bus';
import { roleFromPublicUrl } from '@app-shared/utils/auth-role-query';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() user: any;
  @Input() isUserLoggedIn: boolean;
  @Input() isPublic: boolean;
  userRole = localStorage.getItem('role');
  initials: string;

  // Notification bell/center -- lightweight local-component-state +
  // polling (no store round-trip needed for this), matching the
  // established "pick the simpler thing" convention elsewhere in this
  // header. Shown for any logged-in portal user (employer role '2' or
  // jobseeker role '3'); the backend scopes everything server-side to
  // req.user.uid regardless of role.
  notifications: AppNotification[] = [];
  unreadCount = 0;
  notificationFilter: 'all' | 'subscription' = 'all';
  notificationBusy = false;
  employerUnreadCount: number | null = null;
  hasMorePayments = false;
  private engagementSub: Subscription;
  notifPanelOpen = false;
  private notifPollSub: Subscription;
  private notifReadSub: Subscription;
  private accountRefreshSub: Subscription;
  private static readonly NOTIF_POLL_INTERVAL_MS = 45000;

  // Mobile nav drawer — same pattern as the Employer/Applicant/Admin portal
  // drawers (gh-mobile-drawer + gh-mobile-scrim), so the public site nav
  // (Home/Jobs/Employers/etc.) gets the same modern mobile treatment
  // instead of Bootstrap's plain collapse-dropdown.
  mobileNavOpen = false;
  @ViewChild('mobileMenuBtn') mobileMenuBtnRef: ElementRef<HTMLButtonElement>;
  @ViewChild('firstDrawerLink') firstDrawerLinkRef: ElementRef<HTMLElement>;

  public req: Subscription;
  public location: any;

  // BUGFIX: "Browse jobs" rendered unconditionally whenever isPublic was
  // true, including while the visitor was already ON the jobs browse/
  // detail pages -- a redundant nav action back to where they already
  // are. Hides it for any /jobs* route (browse listing and job detail
  // sub-pages alike); everywhere else on the public site, unaffected.
  get isOnJobsSection(): boolean {
    return !!this.location && this.location.startsWith('/jobs');
  }

  constructor(
    private coreService: CoreService,
    private router: Router,
    private route: ActivatedRoute,
    private appFacade: AppFacade,
    private notificationService: NotificationService,
    private dialog: MatDialog,
    private engagement: SubscriptionEngagementService,
    private refreshBus: EngagementRefreshBus,
  ) {
    this.req = this.router.events.subscribe((event: any) => {
      this.location = this.router.url;

      // scroll to top every page change
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });

      // Close the mobile drawer on navigation -- otherwise it stays open
      // (with its scrim blocking the page) across a route change triggered
      // from outside the drawer, e.g. browser back/forward.
      this.closeMobileNav();
    });
  }

  openMobileNav(): void {
    this.mobileNavOpen = true;
    setTimeout(() => {
      if (this.firstDrawerLinkRef?.nativeElement) {
        this.firstDrawerLinkRef.nativeElement.focus();
      }
    }, 200);
  }

  closeMobileNav(): void {
    if (!this.mobileNavOpen) return;
    this.mobileNavOpen = false;
    setTimeout(() => {
      if (this.mobileMenuBtnRef?.nativeElement) {
        this.mobileMenuBtnRef.nativeElement.focus();
      }
    }, 50);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeNotifPanel();
    if (this.mobileNavOpen) {
      this.closeMobileNav();
    }
  }

  ngOnInit(): void {
    this.accountRefreshSub = this.refreshBus.requests$.subscribe(reason => {
      if (reason === 'checkout_return' && this.isUserLoggedIn && this.userRole === '2') { this.refreshNotifications(); }
    });
    if (this.user) {
      this.initials = this.user.firstName.charAt(0).toUpperCase() + ' ' + this.user.lastName.charAt(0).toUpperCase();
    }

    if (this.isUserLoggedIn && this.user && this.userRole === '2') {
      this.engagementSub = this.engagement.context$.subscribe(context => {
        this.employerUnreadCount = context?.unreadCounts?.total ?? null;
      });
    }
    if (this.isUserLoggedIn && this.user) {
      this.refreshNotifications();
      // Polling, not a websocket -- no real-time push infra exists in this
      // codebase yet; 45s is a reasonable balance between freshness and
      // load for a small in-app notification count.
      this.notifPollSub = interval(HeaderComponent.NOTIF_POLL_INTERVAL_MS).subscribe(() => {
        if (this.userRole === '2') { this.engagement.refresh(); }
        this.refreshNotifications();
      });
    }
  }

  ngOnDestroy(): void {
    this.accountRefreshSub?.unsubscribe();
    this.req?.unsubscribe();
    this.notifReadSub?.unsubscribe();
    this.engagementSub?.unsubscribe();
    if (this.notifPollSub) {
      this.notifPollSub.unsubscribe();
    }
  }

  refreshNotifications(): void {
    this.notifReadSub?.unsubscribe();
    this.notifReadSub = this.notificationService.listCenter(this.userRole === '2').subscribe({
      next: (result) => {
        this.notifications = result.notifications || [];
        this.unreadCount = result.unreadCount || 0;
        this.hasMorePayments = result.hasMorePayments === true;
      },
      error: () => {
        // Non-fatal -- the bell just stays at its last-known state.
      }
    });
  }

  toggleNotifPanel(): void {
    this.notifPanelOpen = !this.notifPanelOpen;
    if (this.notifPanelOpen) {
      this.refreshNotifications();
    }
  }

  closeNotifPanel(): void {
    this.notifPanelOpen = false;
  }

  get displayedUnreadCount(): number { return this.userRole === '2' && this.employerUnreadCount !== null ? this.employerUnreadCount : this.unreadCount + this.notifications.filter(n => n.source === 'payment' && !n.isRead).length; }

  get visibleNotifications(): AppNotification[] {
    return this.notifications.filter(n => this.notificationFilter === 'all' || this.isSubscriptionNotification(n));
  }

  isSubscriptionNotification(n: AppNotification): boolean { return n.category === 'SUBSCRIPTION' || n.category === 'BILLING'; }
  categoryLabel(n: AppNotification): string { return String(n.category || '').toLowerCase().replace(/^./, c => c.toUpperCase()); }
  priorityLabel(n: AppNotification): string { return priorityPresentation(n.priority).label; }
  validNotificationDate(value: string): boolean { return !!value && Number.isFinite(Date.parse(value)); }
  trackNotification(_index: number, n: AppNotification): string { return n.id; }

  onNotificationAction(n: AppNotification, action: CtaAction): void {
    if (this.notificationBusy || !this.isSubscriptionNotification(n)) { return; }
    this.notificationBusy = true;
    const request$ = n.source === 'central'
      ? this.notificationService.interactEmployer(n.id, 'click')
      : this.engagement.click(n.id, action.intent).pipe(map(navigatesAfterClick));
    request$.subscribe(shouldNavigate => {
      this.notificationBusy = false;
      if (shouldNavigate) {
        this.closeNotifPanel();
        this.router.navigateByUrl(action.url);
      }
      this.refreshNotifications();
    });
  }

  dismissNotification(n: AppNotification): void {
    if (this.notificationBusy || n.dismissible !== true || !this.isSubscriptionNotification(n)) { return; }
    this.notificationBusy = true;
    const request$ = n.source === 'central'
      ? this.notificationService.interactEmployer(n.id, 'dismiss')
      : this.engagement.dismiss(n.id).pipe(map(outcome => outcome.outcome !== 'refused'));
    request$.subscribe(dismissed => {
      this.notificationBusy = false;
      if (dismissed) { this.refreshNotifications(); }
    });
  }

  onNotificationClick(notification: AppNotification): void {
    if (!notification.isRead) {
      const read$ = notification.source === 'central' ? this.notificationService.markEmployerRead(notification.id) : notification.source === 'payment' ? this.notificationService.markPaymentRead(notification.id) : this.notificationService.markRead(notification.id);
      read$.subscribe({
        next: (found) => {
          if (!found) { this.refreshNotifications(); return; }
          notification.isRead = true;
          if (notification.source !== 'payment') { this.unreadCount = Math.max(0, this.unreadCount - 1); }
          this.employerUnreadCount = null;
        },
        error: () => {}
      });
    }
    if (this.isSubscriptionNotification(notification)) { return; }
    this.notifPanelOpen = false;
    if (notification.linkRoute) {
      this.router.navigate([notification.linkRoute], {
        queryParams: notification.linkQuery || {}
      });
    }
  }

  markAllNotificationsRead(): void {
    if (this.notificationBusy) { return; }
    this.notificationBusy = true;
    const centralIds = this.visibleNotifications.filter(n => n.source === 'central' && !n.isRead).map(n => n.id);
    const request$: Observable<unknown> = this.userRole === '2' && this.notifications.some(n => n.source === 'central') ? this.notificationService.markVisibleEmployerRead(centralIds) : this.notificationService.markAllRead();
    request$.subscribe({
      next: () => {
        this.notifications = this.notifications.map((n) => n.source === 'payment' ? n : ({ ...n, isRead: true }));
        this.unreadCount = 0;
        this.employerUnreadCount = null;
        this.notificationBusy = false;
        this.refreshNotifications();
      },
      error: () => { this.notificationBusy = false; }
    });
  }

  navigateToJobs(){
    this.router.navigate(['/jobs'], { relativeTo: this.route })
  }

  /** Job Seeker on public pages; Employer on /employers*. */
  get publicAuthQuery(): { role: 2 | 3 } {
    return { role: roleFromPublicUrl(this.location) };
  }

  /** Employer marketing (/employers*) uses purple chrome — on-dark pack held; keep legacy lockup.
   *  NOTE: `this.location` in this component is a URL string (router.url), not Angular Location. */
  get isEmployersPublicRoute(): boolean {
    const raw = typeof this.location === 'string'
      ? this.location
      : (this.router?.url || '');
    const path = (raw || '').split('?')[0];
    return path === '/employers' || path.startsWith('/employers/');
  }

  redirectToRegister() {
    this.router.navigate(['/signin'], { queryParams: this.publicAuthQuery });
  }

  redirectToSignup() {
    this.router.navigate(['/signup'], { queryParams: this.publicAuthQuery });
  }

  goToDashboard() {
    switch (this.userRole) {
      case '1':
        this.router.navigateByUrl('/admin/dashboard');
        break;
      case '2':
        this.router.navigateByUrl('/recruiter/dashboard');
        break;
      case '3':
        this.router.navigateByUrl('/user/dashboard');
        break;
    }
  }

  // LOGOUT-CONFIRM: normal user-initiated logout now asks for confirmation
  // first (reuses the shared ConfirmationDialogComponent, same pattern as
  // every other confirm/cancel dialog in the app). Cancel leaves the
  // session completely untouched -- performLogout() below is only ever
  // called after an explicit "Proceed to Logout".
  logout() {
    this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Log out?',
        message: 'Are you sure you want to log out of your GetHired account?',
        confirmLabel: 'Proceed to Logout',
        cancelLabel: 'Cancel',
      },
    }).afterClosed().subscribe((result) => {
      if (result === 1) {
        this.performLogout();
      }
    });
  }

  private performLogout(): void {
    // Was localStorage.clear() -- the same unsafe blanket-clear bug fixed
    // in CoreService.logout() earlier (bc2d35e0), reintroduced here via a
    // separate, unguarded logout path. A blanket clear() deletes ANY other
    // owner's AI Create recovery/guest data sharing this storage, not just
    // this session's own keys. Routed through the canonical logout() (real
    // backend revoke + targeted key removal + NgRx credentials reset) so
    // every logout path in the app behaves identically.
    this.coreService.logout();
    this.appFacade.resetCredentials();
    this.router.navigateByUrl('/signin');
  }
}
