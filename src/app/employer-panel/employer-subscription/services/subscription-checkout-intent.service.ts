import { Injectable } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'environments/environment';
import { BillingCycle } from '../subscription-v4.models';
import { SKIP_SESSION_EXPIRY } from '../../../core/interceptor/unauthorize.interceptor';

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
interface LegacyCheckoutIntentResponse {
  success: boolean;
  status?: string;
  checkoutIntentId?: string;
  checkoutUrl?: string | null;
  disclosure?: {
    checkoutUrl?: string | null;
    selectedBillingCycle?: BillingCycle;
    amountDueToday?: number;
  };
}
interface LegacyCheckoutReturnStatus {
  success: boolean;
  checkoutIntentId: string;
  returnStatus: string;
  billingCycle: BillingCycle;
  lifecycle?: { planSlug?: string | null; status?: string | null } | null;
}
export interface StorageAddonCheckoutRequest { packageCode: 'storage_25' | 'storage_100' | 'storage_250'; billingCycle: 'monthly'; idempotencyKey?: string; }
@Injectable({ providedIn: 'root' })
export class SubscriptionCheckoutIntentService {
  private apiBase = `${environment.api_url}/employer/subscription`;
  constructor(private http: HttpClient) {}
  createCheckoutIntent(request: EmployerCheckoutRequest): Observable<EmployerCheckoutResponse> {
    // Production currently exposes the hardened V4 checkout-intent route.
    // Adapt its server-priced response to the newer UI contract so checkout
    // remains a backend-authoritative PayMongo redirect.
    return this.http.post<LegacyCheckoutIntentResponse>(`${environment.api_url}/subscriptions/checkout-intent`, {
      planSlug: request.planCode,
      billingCycle: request.billingCycle,
      idempotencyKey: request.idempotencyKey,
    }, this.authOptions()).pipe(map(res => {
      const disclosure = res.disclosure || {};
      return {
        success: res.success === true,
        paymentAttemptId: res.checkoutIntentId || '',
        provider: 'PAYMONGO' as const,
        checkoutUrl: res.checkoutUrl || disclosure.checkoutUrl || null,
        status: String(res.status || 'pending').toUpperCase() as PaymentAttemptStatus,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        amountMinor: Math.round(Number(disclosure.amountDueToday || 0) * 100),
        currency: 'PHP' as const,
        billingCycle: disclosure.selectedBillingCycle || request.billingCycle,
        purchaseType: 'SUBSCRIPTION',
      };
    }));
  }
  previewUpgrade(request: Pick<EmployerCheckoutRequest, 'planCode' | 'billingCycle'>): Observable<EmployerUpgradePreview> {
    return this.http.post<EmployerUpgradePreview>(`${this.apiBase}/upgrade-preview`, request, {
      ...this.authOptions(),
      context: new HttpContext().set(SKIP_SESSION_EXPIRY, true),
    });
  }
  getCheckoutIntentStatus(id: string): Observable<PaymentAttemptStatusResponse> {
    return this.http.get<LegacyCheckoutReturnStatus>(`${environment.api_url}/subscriptions/checkout-intent/${encodeURIComponent(id)}/return-status`, this.authOptions())
      .pipe(map(res => ({
        success: res.success === true,
        paymentAttemptId: res.checkoutIntentId,
        provider: 'PAYMONGO' as const,
        status: this.mapLegacyReturnStatus(res.returnStatus),
        expiresAt: '',
        amountMinor: 0,
        currency: 'PHP' as const,
        billingCycle: res.billingCycle || 'monthly',
        purchaseType: 'SUBSCRIPTION',
        subscription: res.lifecycle ? {
          planCode: res.lifecycle.planSlug || null,
          billingCycle: res.billingCycle || 'monthly',
          status: res.returnStatus === 'payment_success_confirmed' ? 'active' : (res.lifecycle.status || undefined),
        } : null,
      })));
  }
  createStorageAddonCheckout(request: StorageAddonCheckoutRequest): Observable<EmployerCheckoutResponse> {
    return this.http.post<EmployerCheckoutResponse>(`${environment.api_url}/employer/storage-addons/checkout`, request);
  }

  private mapLegacyReturnStatus(status: string): PaymentAttemptStatus {
    if (status === 'payment_success_confirmed') { return 'PAID'; }
    if (status === 'payment_failed') { return 'FAILED'; }
    if (status === 'payment_expired') { return 'EXPIRED'; }
    return 'PENDING';
  }

  /**
   * The deployed checkout routes require Firebase bearer authentication.
   * Keep the token on these two payment requests explicitly as well as via
   * the app-wide interceptor. This protects lazy-loaded subscription code
   * from losing the header when its HttpClient chain is reconstructed after
   * a Google sign-in redirect.
   */
  private authOptions(): { headers?: Record<string, string> } {
    if (typeof localStorage === 'undefined') { return {}; }
    const token = localStorage.getItem('token');
    return token ? { headers: { Authorization: token } } : {};
  }
}
