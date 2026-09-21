import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from 'environments/environment';
import { SubscriptionCheckoutIntentService } from './subscription-checkout-intent.service';
import { CheckoutReturnStatusComponent } from '../components/checkout-return-status/checkout-return-status.component';
import { EngagementRefreshBus } from '@main/shared/engagement/engagement-refresh.bus';

describe('SubscriptionCheckoutIntentService employer billing contract', () => {
  let service: SubscriptionCheckoutIntentService;
  let http: HttpTestingController;
  beforeEach(() => {
    localStorage.setItem('token', 'Bearer checkout-token');
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(SubscriptionCheckoutIntentService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => localStorage.removeItem('token'));
  afterEach(() => http.verify());

  it('creates checkout without client price or company identifiers', () => {
    const body = { planCode: 'growth', billingCycle: 'monthly' as const, idempotencyKey: 'stable-key' };
    let response: any;
    service.createCheckoutIntent(body).subscribe(value => response = value);
    const req = http.expectOne(`${environment.api_url}/subscriptions/checkout-intent`);
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Authorization')).toBe('Bearer checkout-token');
    expect(req.request.body).toEqual({ planSlug: 'growth', billingCycle: 'monthly', idempotencyKey: 'stable-key' });
    expect(req.request.body.amount).toBeUndefined();
    expect(req.request.body.companyId).toBeUndefined();
    req.flush({ success: true, status: 'pending', checkoutIntentId: 'SUBS-1', disclosure: { checkoutUrl: 'https://checkout.paymongo.com/link', selectedBillingCycle: 'monthly', amountDueToday: 3490 } });
    expect(response).toEqual(jasmine.objectContaining({ success: true, paymentAttemptId: 'SUBS-1', checkoutUrl: 'https://checkout.paymongo.com/link', status: 'PENDING', amountMinor: 349000 }));
  });

  it('reads only the account-scoped payment attempt status', () => {
    service.getCheckoutIntentStatus('attempt/1').subscribe();
    const req = http.expectOne(`${environment.api_url}/subscriptions/checkout-intent/attempt%2F1/return-status`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer checkout-token');
    req.flush({ success: true, checkoutIntentId: 'attempt/1', returnStatus: 'payment_pending', billingCycle: 'monthly' });
  });

  it('loads the server-selected price and entitlements before checkout', () => {
    const body = { planCode: 'premium', billingCycle: 'monthly' as const };
    service.previewUpgrade(body).subscribe();
    const req = http.expectOne(`${environment.api_url}/employer/subscription/upgrade-preview`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    expect(req.request.body.amountMinor).toBeUndefined();
    req.flush({success:true,amountMinor:599000,currency:'PHP'});
  });

  it('creates a server-priced storage add-on checkout', () => {
    const body = { packageCode: 'storage_25' as const, billingCycle: 'monthly' as const, idempotencyKey: 'storage-key' };
    service.createStorageAddonCheckout(body).subscribe();
    const req = http.expectOne(`${environment.api_url}/employer/storage-addons/checkout`);
    expect(req.request.body).toEqual(body);
    expect(req.request.body.amountMinor).toBeUndefined();
    req.flush({ success: true });
  });

  it('stitches checkout creation, pending status and authoritative paid confirmation', () => {
    const bus = TestBed.inject(EngagementRefreshBus);
    spyOn(bus, 'request');
    const component = new CheckoutReturnStatusComponent({} as any, {} as any, service, {markForCheck: () => {}} as any, bus);
    service.createCheckoutIntent({planCode:'growth',billingCycle:'monthly',idempotencyKey:'journey-key'}).subscribe(attempt => {
      component.intentId = attempt.paymentAttemptId;
      component.loadStatus();
    });
    http.expectOne(`${environment.api_url}/subscriptions/checkout-intent`).flush({success:true,checkoutIntentId:'journey-1',status:'pending',disclosure:{billingCycle:'monthly'}});
    http.expectOne(`${environment.api_url}/subscriptions/checkout-intent/journey-1/return-status`).flush({success:true,checkoutIntentId:'journey-1',returnStatus:'payment_pending',billingCycle:'monthly'});
    expect(component.returnStatus).toBe('payment_pending');
    expect(component.activatedPlanName).toBeNull();
    expect(bus.request).not.toHaveBeenCalled();
    component.checkAgain();
    http.expectOne(`${environment.api_url}/subscriptions/checkout-intent/journey-1/return-status`).flush({success:true,checkoutIntentId:'journey-1',returnStatus:'payment_success_confirmed',billingCycle:'monthly',lifecycle:{planSlug:'growth',status:'active'}});
    expect(component.returnStatus).toBe('payment_success_confirmed');
    expect(component.activatedPlanName).toBe('Growth');
    expect(bus.request).toHaveBeenCalledOnceWith('checkout_return');
    component.ngOnDestroy();
  });
});
