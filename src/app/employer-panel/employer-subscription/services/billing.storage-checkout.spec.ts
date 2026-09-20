import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from 'environments/environment';
import { BillingService } from './billing.service';

describe('BillingService storage add-on checkout', () => {
  let service: BillingService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(BillingService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('uses the authenticated server-authoritative storage checkout endpoint', () => {
    service.createStorageAddonCheckout({ packageCode: 'storage_100', billingCycle: 'monthly' }).subscribe();

    const request = http.expectOne(`${environment.api_url}/employer/storage-addons/checkout`);
    expect(request.request.method).toBe('POST');
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
