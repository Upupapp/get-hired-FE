import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { BillingCycle } from '../subscription-v4.models';

export type PaymentAttemptStatus = 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED';
export interface EmployerCheckoutRequest {
  planCode: string;
  billingCycle: BillingCycle;
  idempotencyKey?: string;
  operation?: 'renewal';
  enterpriseOrderId?: string;
}
export interface EmployerCheckoutResponse {
  success: boolean;
  paymentAttemptId: string;
  provider: 'PAYMONGO';
  checkoutUrl: string | null;
  status: PaymentAttemptStatus;
  expiresAt: string;
  amountMinor: number;
  currency: 'PHP';
  billingCycle: BillingCycle;
  purchaseType: string;
}
export interface PaymentAttemptStatusResponse extends Omit<EmployerCheckoutResponse, 'checkoutUrl'> {
  safeFailureCategory?: string | null;
  subscription?: { planCode?: string | null; billingCycle?: BillingCycle; status?: string; periodStart?: string; periodEnd?: string } | null;
}
export interface EmployerUpgradePreview {
  success: boolean;
  planVersionId: string;
  purchaseType: string;
  amountMinor: number;
  currency: 'PHP';
  billingCycle: BillingCycle;
  billingMode: 'UPFRONT';
  entitlements: Record<string, number | boolean | null>;
  proration: false;
}
export interface StorageAddonCheckoutRequest { packageCode: 'storage_25' | 'storage_100' | 'storage_250'; billingCycle: 'monthly'; idempotencyKey?: string; }
@Injectable({ providedIn: 'root' })
export class SubscriptionCheckoutIntentService {
  private apiBase = `${environment.api_url}/employer/subscription`;
  constructor(private http: HttpClient) {}
  createCheckoutIntent(request: EmployerCheckoutRequest): Observable<EmployerCheckoutResponse> {
    return this.http.post<EmployerCheckoutResponse>(`${this.apiBase}/checkout`, request);
  }
  previewUpgrade(request: Pick<EmployerCheckoutRequest, 'planCode' | 'billingCycle'>): Observable<EmployerUpgradePreview> {
    return this.http.post<EmployerUpgradePreview>(`${this.apiBase}/upgrade-preview`, request);
  }
  getCheckoutIntentStatus(id: string): Observable<PaymentAttemptStatusResponse> {
    return this.http.get<PaymentAttemptStatusResponse>(`${this.apiBase}/checkout/${encodeURIComponent(id)}/status`);
  }
  createStorageAddonCheckout(request: StorageAddonCheckoutRequest): Observable<EmployerCheckoutResponse> {
    return this.http.post<EmployerCheckoutResponse>(`${environment.api_url}/employer/storage-addons/checkout`, request);
  }
}
