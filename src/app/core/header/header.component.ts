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
import { Subscription, interval } from 'rxjs';
import { NotificationService, AppNotification } from '@main/shared/services/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '@app-shared/components/confirmation-dialog/confirmation-dialog.component';

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
  notifPanelOpen = false;
  private notifPollSub: Subscription;
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

  constructor(
    private coreService: CoreService,
    private router: Router,
    private route: ActivatedRoute,
    private appFacade: AppFacade,
    private notificationService: NotificationService,
    private dialog: MatDialog,
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
    if (this.mobileNavOpen) {
      this.closeMobileNav();
    }
  }

  ngOnInit(): void {
    if (this.user) {
      this.initials = this.user.firstName.charAt(0).toUpperCase() + ' ' + this.user.lastName.charAt(0).toUpperCase();
    }

    if (this.isUserLoggedIn && this.user) {
      this.refreshNotifications();
      // Polling, not a websocket -- no real-time push infra exists in this
      // codebase yet; 45s is a reasonable balance between freshness and
      // load for a small in-app notification count.
      this.notifPollSub = interval(HeaderComponent.NOTIF_POLL_INTERVAL_MS).subscribe(() => {
        this.refreshNotifications();
      });
    }
  }

  ngOnDestroy(): void {
    if (this.notifPollSub) {
      this.notifPollSub.unsubscribe();
    }
  }

  refreshNotifications(): void {
    this.notificationService.list().subscribe({
      next: (result) => {
        this.notifications = result.notifications || [];
        this.unreadCount = result.unreadCount || 0;
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

  onNotificationClick(notification: AppNotification): void {
    if (!notification.isRead) {
      this.notificationService.markRead(notification.id).subscribe({
        next: () => {
          notification.isRead = true;
          this.unreadCount = Math.max(0, this.unreadCount - 1);
        },
        error: () => {}
      });
    }
    this.notifPanelOpen = false;
    if (notification.linkRoute) {
      this.router.navigate([notification.linkRoute], {
        queryParams: notification.linkQuery || {}
      });
    }
  }

  markAllNotificationsRead(): void {
    this.notificationService.markAllRead().subscribe({
      next: () => {
        this.notifications = this.notifications.map((n) => ({ ...n, isRead: true }));
        this.unreadCount = 0;
      },
      error: () => {}
    });
  }

  navigateToJobs(){
    this.router.navigate(['/jobs'], { relativeTo: this.route })
  }

  redirectToRegister() {
    this.router.navigateByUrl('/signin');
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
