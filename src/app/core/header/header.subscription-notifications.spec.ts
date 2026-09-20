import { NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { A11yModule } from '@angular/cdk/a11y';
import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { EMPTY, of, Subject } from 'rxjs';
import { HeaderComponent } from './header.component';
import { CoreService } from '../services/core.service';
import { AppFacade } from '@main/state/app.facade';
import { NotificationService } from '@main/shared/services/notification.service';
import { SubscriptionEngagementService } from '@main/shared/engagement/subscription-engagement.service';
import { EngagementRefreshBus } from '@main/shared/engagement/engagement-refresh.bus';
import { BELL_LIST_RESPONSE } from '../../../testing/engagement-contract.fixture';

describe('Existing header: subscription and billing notifications', () => {
  function setup() {
    const rows = JSON.parse(JSON.stringify(BELL_LIST_RESPONSE.data.notifications));
    const subscription = rows.find((n: any) => n.category === 'SUBSCRIPTION');
    const notifications = jasmine.createSpyObj('NotificationService', ['listCenter', 'markRead', 'markPaymentRead', 'markAllRead']);
    notifications.listCenter.and.returnValue(of({ notifications: rows, unreadCount: 2 }));
    notifications.markRead.and.returnValue(of(true));
    const engagement = jasmine.createSpyObj('SubscriptionEngagementService', ['click', 'dismiss', 'refresh']);
    engagement.click.and.returnValue(of({ outcome: 'applied', status: 'CLICKED' }));
    engagement.dismiss.and.returnValue(of({ outcome: 'applied', status: 'DISMISSED' }));
    const router = { events: EMPTY, url: '/recruiter/dashboard', navigate: jasmine.createSpy('navigate'), navigateByUrl: jasmine.createSpy('navigateByUrl') };
    TestBed.configureTestingModule({
      declarations: [HeaderComponent], imports: [CommonModule, A11yModule], schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: CoreService, useValue: {} }, { provide: AppFacade, useValue: {} },
        { provide: Router, useValue: router }, { provide: ActivatedRoute, useValue: {} },
        { provide: MatDialog, useValue: {} }, { provide: NotificationService, useValue: notifications },
        { provide: SubscriptionEngagementService, useValue: engagement },
      ],
    });
    const fixture = TestBed.createComponent(HeaderComponent);
    const component = fixture.componentInstance;
    component.userRole = '2'; component.isPublic = false;
    component.notifications = rows; component.notifPanelOpen = true;
    fixture.detectChanges();
    return { fixture, component, router, engagement, notifications, subscription };
  }

  it('filters the existing list and keeps the same center outside the desktop-only navigation', () => {
    const { component, fixture } = setup();
    component.notificationFilter = 'subscription'; fixture.detectChanges();
    expect(component.visibleNotifications.every(n => n.category === 'SUBSCRIPTION' || n.category === 'BILLING')).toBeTrue();
    const panel = fixture.nativeElement.querySelector('.gh-nav-notif-panel');
    expect(panel.closest('.d-none')).toBeNull();
    expect(panel.getAttribute('aria-modal')).toBe('true');
    expect(panel.textContent).toContain('Subscription & Billing');
    component.notifications = []; fixture.detectChanges();
    expect(panel.textContent).toContain('No subscription or billing notifications.');
  });

  it('refreshes the notification center immediately after checkout settlement', () => {
    const { component, notifications } = setup();
    component.isUserLoggedIn = true;
    TestBed.inject(EngagementRefreshBus).request('checkout_return');
    expect(notifications.listCenter).toHaveBeenCalledWith(true);
  });

  it('tracks the offered action before navigating to the exact backend destination', () => {
    const { component, subscription, engagement, router } = setup();
    const pending = new Subject<any>(); engagement.click.and.returnValue(pending);
    component.onNotificationAction(subscription, subscription.cta.primary);
    expect(engagement.click).toHaveBeenCalledWith(subscription.id, subscription.cta.primary.intent);
    expect(router.navigateByUrl).not.toHaveBeenCalled();
    pending.next({ outcome: 'applied', status: 'CLICKED' }); pending.complete();
    expect(router.navigateByUrl).toHaveBeenCalledWith(subscription.cta.primary.url);
  });

  it('refused click stays in the center; a refused dismissal preserves the row', () => {
    const { component, subscription, engagement, router } = setup();
    engagement.click.and.returnValue(of({ outcome: 'refused', httpStatus: 400 }));
    component.onNotificationAction(subscription, subscription.cta.primary);
    expect(router.navigateByUrl).not.toHaveBeenCalled(); expect(component.notifPanelOpen).toBeTrue();
    engagement.dismiss.and.returnValue(of({ outcome: 'refused', httpStatus: 409 }));
    const before = component.notifications;
    component.dismissNotification(subscription); expect(component.notifications).toBe(before);
  });

  it('does not offer or send dismissal for a non-dismissible operational row', () => {
    const { component, subscription, engagement, fixture } = setup();
    subscription.dismissible = false; component.notifications = [subscription]; fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.gh-notif-actions').textContent).not.toContain('Not Now');
    component.dismissNotification(subscription); expect(engagement.dismiss).not.toHaveBeenCalled();
    component.onEscape(); expect(component.notifPanelOpen).toBeFalse();
  });

  it('mark-read is backend-confirmed and opening a subscription record does not redirect', () => {
    const { component, subscription, notifications, router } = setup();
    subscription.isRead = false; component.unreadCount = 2;
    notifications.markRead.and.returnValue(of(false)); component.onNotificationClick(subscription);
    expect(subscription.isRead).toBeFalse(); expect(component.unreadCount).toBe(2);
    notifications.markRead.and.returnValue(of(true)); component.onNotificationClick(subscription);
    expect(subscription.isRead).toBeTrue(); expect(component.unreadCount).toBe(1);
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
