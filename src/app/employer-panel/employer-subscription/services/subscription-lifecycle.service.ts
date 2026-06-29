import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

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

export interface SubscriptionNotification {
  id: number;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  metadata: Record<string, any>;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class SubscriptionLifecycleService {
  private base = environment.api_url;

  constructor(private http: HttpClient) {}

  getLifecycleStatus(): Observable<LifecycleStatusResponse> {
    return this.http.get<LifecycleStatusResponse>(`${this.base}/api/subscriptions/lifecycle/status`);
  }

  getCheckoutReturnStatus(intentId: string): Observable<CheckoutReturnStatus> {
    return this.http.get<CheckoutReturnStatus>(`${this.base}/api/subscriptions/checkout-intent/${intentId}/return-status`);
  }

  getNotifications(): Observable<{ success: boolean; notifications: SubscriptionNotification[] }> {
    return this.http.get<any>(`${this.base}/api/subscriptions/notifications`);
  }

  markNotificationRead(id: number): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.base}/api/subscriptions/notifications/${id}/read`, {});
  }

  triggerDunningCheck(): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.base}/api/subscriptions/dunning/check`, {});
  }
}
