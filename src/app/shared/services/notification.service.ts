import { Injectable } from '@angular/core';
import { BaseService } from '@main/core/services/base.service';
import { environment } from 'environments/environment';
import { Observable, forkJoin, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { EmployerNotificationResponse, EmployerInteractionResponse } from '@main/shared/engagement/employer-engagement.models';
import { employerAction } from '@main/shared/engagement/employer-engagement.adapter';
import { catchError } from 'rxjs/operators';
import { SubscriptionLifecycleService } from '@main/employer-panel/employer-subscription/services/subscription-lifecycle.service';
import { map, tap } from 'rxjs/operators';
import type { CtaAction, EngagementPriority, NotificationCategory } from '@main/shared/engagement/engagement-contract.models';
import { EngagementRefreshBus } from '@main/shared/engagement/engagement-refresh.bus';

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  linkRoute: string | null;
  linkQuery: Record<string, any> | null;
  relatedApplicationId: string | null;
  relatedJobId: string | null;
  isRead: boolean;
  createdAt: string;
  category?: NotificationCategory;
  priority?: EngagementPriority | null;
  cta?: { primary: CtaAction | null; secondary: CtaAction | null } | null;
  dismissible?: boolean;
  expiresAt?: string | null;
  source?: 'payment' | 'engine' | 'central';
}

export interface NotificationListResult {
  notifications: AppNotification[];
  unreadCount: number;
  hasMorePayments?: boolean;
}

/**
 * Frontend for the notification bell/center backend
 * (controllers/notificationController.js, services/notification.service.js).
 * Mirrors message.service.ts's structure -- the backend always derives the
 * caller's identity server-side from the authenticated uid, never from
 * anything sent here.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private base = `${environment.api_url}/notifications`;

  constructor(private baseService: BaseService, private refreshBus: EngagementRefreshBus, private lifecycle: SubscriptionLifecycleService, private http: HttpClient) {}

  /** E2.1: bell rows and payment-only rows never overlap. Permissions are enforced by the backend. */
  listV4Center(includePayments: boolean): Observable<NotificationListResult> {
    if (!includePayments) { return this.list(); }
    return forkJoin({
      bell: this.list().pipe(catchError(() => of({ notifications: [], unreadCount: 0 }))),
      payment: this.lifecycle.getNotifications({ source: ['payment'], status: 'ALL', limit: 50 }).pipe(catchError(() => of(null))),
    }).pipe(map(({ bell, payment }) => ({
      notifications: [...bell.notifications, ...(payment?.notifications || []).filter(n => n.source === 'payment').map(n => ({
        ...n, linkRoute: null, linkQuery: null, relatedApplicationId: null, relatedJobId: null,
      }))].sort((a, b) => (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0)),
      // The subscription list count includes engine rows too. Never add it to the bell count.
      unreadCount: bell.unreadCount,
      hasMorePayments: payment?.hasMore === true,
    })));
  }

  listCenter(employer: boolean): Observable<NotificationListResult> {
    if (!employer) { return this.list(); }
    return this.http.get<EmployerNotificationResponse>(`${environment.api_url}/employer/notifications?limit=100`).pipe(
      map(result => ({
        notifications: result.success === true ? (result.items || []).filter(n => ['DELIVERED', 'READ', 'CLICKED'].indexOf(n.status) !== -1).map(n => ({
          ...n, source: 'central' as const, isRead: n.read, linkRoute: null, linkQuery: null, relatedApplicationId: null, relatedJobId: null,
          cta: {primary: n.cta?.primary ? employerAction(n.cta.primary) : null, secondary: n.cta?.secondary ? employerAction(n.cta.secondary) : null},
          // No dismissibility field is supplied for list rows. Do not guess one from priority.
          dismissible: false,
        })) : [],
        unreadCount: result.success === true ? result.unreadCount : 0,
      })),
      catchError(error => error.status === 503 && error.error?.error?.code === 'ENGAGEMENT_DISABLED' ? this.list() : of({notifications: [], unreadCount: 0})),
    );
  }

  markEmployerRead(id: string): Observable<boolean> {
    return this.http.patch<EmployerInteractionResponse>(`${environment.api_url}/employer/notifications/${encodeURIComponent(id)}/read`, {}).pipe(
      map(result => result.success === true && result.updated === true), tap(() => this.refreshBus.request('bell_read')),
    );
  }

  interactEmployer(id: string, action: 'click' | 'dismiss'): Observable<boolean> {
    const url = `${environment.api_url}/employer/notifications/${encodeURIComponent(id)}/${action}`;
    const request$ = action === 'click'
      ? this.http.post<EmployerInteractionResponse>(url, {})
      : this.http.patch<EmployerInteractionResponse>(url, {});
    return request$.pipe(
      map(result => result.success === true && result.updated === true),
      tap(() => this.refreshBus.request('account_refresh')),
      catchError(() => of(false)),
    );
  }

  markVisibleEmployerRead(ids: string[]): Observable<boolean[]> {
    return ids.length ? forkJoin(ids.map(id => this.markEmployerRead(id))) : of([]);
  }

  markPaymentRead(id: string): Observable<boolean> {
    return this.lifecycle.markNotificationRead(id).pipe(map(result => result.found), tap(() => this.refreshBus.request('bell_read')));
  }

  list(): Observable<NotificationListResult> {
    return this.baseService
      .get<any>(`${this.base}`)
      .pipe(map((res: any) => res?.data ?? { notifications: [], unreadCount: 0 }));
  }

  markRead(id: string): Observable<boolean> {
    return this.baseService
      .post<any>(`${this.base}/${id}/read`, {})
      .pipe(map((res: any) => !!res?.data?.found), tap(() => this.refreshBus.request('bell_read')));
  }

  markAllRead(): Observable<number> {
    return this.baseService
      .post<any>(`${this.base}/read-all`, {})
      .pipe(map((res: any) => res?.data?.updatedCount ?? 0), tap(() => this.refreshBus.request('bell_read')));
  }

  delete(id: string): Observable<boolean> {
    return this.baseService
      .delete<any>(`${this.base}/${id}`)
      .pipe(map((res: any) => !!res?.data?.found), tap(() => this.refreshBus.request('bell_dismissed')));
  }
}
