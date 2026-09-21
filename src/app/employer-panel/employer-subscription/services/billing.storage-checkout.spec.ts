import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from 'environments/environment';
import { BillingService } from './billing.service';

describe('BillingService storage add-on checkout', () => {
  let service: BillingService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.setItem('token', 'Bearer billing-token');
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(BillingService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    localStorage.removeItem('token');
    http.verify();
  });

  it('sends the current bearer token on billing history and profile reads', () => {
    service.listInvoices({ limit: 20, offset: 0 }).subscribe();
    const invoices = http.expectOne(`${environment.api_url}/billing/invoices?limit=20&offset=0`);
    expect(invoices.request.headers.get('Authorization')).toBe('Bearer billing-token');
    invoices.flush({ success: true, invoices: [], pagination: { total: 0, limit: 20, offset: 0 } });

    service.getBillingProfile().subscribe();
    const profile = http.expectOne(`${environment.api_url}/billing/profile`);
    expect(profile.request.headers.get('Authorization')).toBe('Bearer billing-token');
    profile.flush({ success: true, profile: {} });
  });

  it('uses the authenticated server-authoritative storage checkout endpoint', () => {
    service.createStorageAddonCheckout({ packageCode: 'storage_100', billingCycle: 'monthly' }).subscribe();

    const request = http.expectOne(`${environment.api_url}/employer/storage-addons/checkout`);
    expect(request.request.method).toBe('POST');
    expect(request.request.headers.get('Authorization')).toBe('Bearer billing-token');
    expect(request.request.body).toEqual({ packageCode: 'storage_100', billingCycle: 'monthly' });
    request.flush({
      success: true,
      paymentAttemptId: 'attempt-1',
      provider: 'PAYMONGO',
      checkoutUrl: 'https://checkout.paymongo.com/test',
      status: 'PENDING',
      expiresAt: '2026-09-20T12:00:00.000Z',
      amountMinor: 149000,
      currency: 'PHP',
      billingCycle: 'monthly',
      purchaseType: 'STORAGE_ADDON',
    });
  });
});
