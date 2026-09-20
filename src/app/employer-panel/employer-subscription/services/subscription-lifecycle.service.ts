import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import {
  CtaIntent, MessageActionResult, NotificationItem, NotificationListQuery, NotificationListResponse,
} from '@main/shared/engagement/engagement-contract.models';

export interface LifecycleStatus {
  status: string;
  planSlug: string | null;
  billingCycle: string;
  periodStart: string | null;
  periodEnd: string | null;
  trialEndsAt: string | null;
  amountPaid: number | null;
  isPaid: boolean;
  subscriptionId: number | null;
  subscriptionName: string | null;
  statusCopy: string;
}

export interface LifecycleStatusResponse {
  success: boolean;
  lifecycle: LifecycleStatus;
}

export interface CheckoutReturnStatus {
  success: boolean;
  checkoutIntentId: string;
  returnStatus: 'checking_payment' | 'payment_pending' | 'payment_success_confirmed' | 'payment_failed' | 'payment_expired' | 'payment_unknown_retry';
  billingCycle: string;
  userMessage: string;
  lifecycle: LifecycleStatus | null;
}

/**
 * One subscription or billing message (contract §4.3). Its id is a string: engine messages look like
 * `NOTIF-26-48213907`, payment notices like `SUBN-42`. Before E2 this endpoint returned numbers.
 */
export type SubscriptionNotification = NotificationItem;

@Injectable({ providedIn: 'root' })
export class SubscriptionLifecycleService {
  private base = environment.api_url;

  constructor(private http: HttpClient) {}

  getLifecycleStatus(): Observable<LifecycleStatusResponse> {
    return this.http.get<LifecycleStatusResponse>(`${this.base}/subscriptions/lifecycle/status`);
  }

  getCheckoutReturnStatus(intentId: string): Observable<CheckoutReturnStatus> {
    return this.http.get<CheckoutReturnStatus>(`${this.base}/subscriptions/checkout-intent/${intentId}/return-status`);
  }

  /** The caller's subscription and billing messages, newest first (contract §3.2). Unread by default. */
  getNotifications(query: NotificationListQuery = {}): Observable<NotificationListResponse> {
    let params = new HttpParams();
    if (query.source && query.source.length) { params = params.set('source', query.source.join(',')); }
    if (query.status) { params = params.set('status', query.status); }
    if (query.category && query.category.length) { params = params.set('category', query.category.join(',')); }
    if (query.priority && query.priority.length) { params = params.set('priority', query.priority.join(',')); }
    if (query.page !== undefined) { params = params.set('page', String(query.page)); }
    if (query.limit !== undefined) { params = params.set('limit', String(query.limit)); }
    return this.http.get<NotificationListResponse>(`${this.base}/subscriptions/notifications`, { params });
  }

  /** `found: false` means nothing this viewer could see matched: a 200 answer, not a failure (contract §3.3). */
  markNotificationRead(id: string): Observable<MessageActionResult> {
    return this.http.post<MessageActionResult>(`${this.base}/subscriptions/notifications/${encodeURIComponent(id)}/read`, {});
  }

  /** An engine id or a context id (`nudge:<ruleKey>`). 409 NOT_DISMISSIBLE for CRITICAL and `SUBN-` notices (contract §3.4). */
  dismissNotification(id: string): Observable<MessageActionResult> {
    return this.http.post<MessageActionResult>(`${this.base}/subscriptions/notifications/${encodeURIComponent(id)}/dismiss`, {});
  }

  /** Records the click only; the endpoint does not redirect. 400 INVALID_INTENT when the intent is not offered (contract §3.5). */
  clickNotification(id: string, intent: CtaIntent): Observable<MessageActionResult> {
    return this.http.post<MessageActionResult>(`${this.base}/subscriptions/notifications/${encodeURIComponent(id)}/click`, { intent });
  }

  triggerDunningCheck(): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.base}/subscriptions/dunning/check`, {});
  }
}
