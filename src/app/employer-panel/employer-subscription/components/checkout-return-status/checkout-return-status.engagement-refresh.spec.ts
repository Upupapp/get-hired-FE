import { of, Subject, throwError } from 'rxjs';
import { EngagementRefreshBus } from '@main/shared/engagement/engagement-refresh.bus';
import { CheckoutReturnStatusComponent } from './checkout-return-status.component';

/** F1: a checkout return that settled changed the subscription, so the engagement context is read again. */
describe('CheckoutReturnStatusComponent -- a settled checkout return reads the engagement context again (F1)', () => {
  function build(answer: string | Error): { component: CheckoutReturnStatusComponent; bus: EngagementRefreshBus } {
    const bus = new EngagementRefreshBus();
    spyOn(bus, 'request');
    const checkout = {
      getCheckoutIntentStatus: jasmine.createSpy('getCheckoutIntentStatus').and.returnValue(answer instanceof Error
        ? throwError(() => answer)
        : of({ success: true, paymentAttemptId: 'CI-1', status: ({
          payment_success_confirmed: 'PAID', payment_failed: 'FAILED', payment_expired: 'EXPIRED',
          checking_payment: 'PENDING', payment_pending: 'PENDING', payment_unknown_retry: 'UNKNOWN',
        } as any)[answer as string], billingCycle: 'monthly', subscription: null })),
    };
    const component = new CheckoutReturnStatusComponent({} as any, {} as any, checkout as any, { markForCheck: () => {} } as any, bus);
    (component as any).intentId = 'CI-1';
    return { component, bus };
  }

  ['payment_success_confirmed', 'payment_failed', 'payment_expired'].forEach(status => {
    it(`${status}: one refresh request`, () => {
      const { component, bus } = build(status);
      component.loadStatus();
      expect((bus.request as jasmine.Spy).calls.allArgs()).toEqual([['checkout_return']]);
    });
  });

  ['checking_payment', 'payment_pending', 'payment_unknown_retry'].forEach(status => {
    it(`${status}: nothing settled, no refresh request`, () => {
      const { component, bus } = build(status);
      component.loadStatus();
      expect(bus.request).not.toHaveBeenCalled();
    });
  });

  it('the status could not be read: no refresh request', () => {
    const { component, bus } = build(new Error('offline'));
    component.loadStatus();
    expect(bus.request).not.toHaveBeenCalled();
  });
  it('a repeat confirmation refreshes once instead of replaying activation effects', () => {
    const { component, bus } = build('payment_success_confirmed');
    component.loadStatus(); component.loadStatus();
    expect((bus.request as jasmine.Spy).calls.count()).toBe(1);
  });
  it('success:false never renders a confirmed activation or refreshes entitlements', () => {
    const { component, bus } = build('payment_success_confirmed');
    (component as any).checkoutService.getCheckoutIntentStatus.and.returnValue(of({success: false, status: 'PAID'}));
    component.loadStatus();
    expect(component.returnStatus).toBe('payment_unknown_retry');
    expect(component.activatedPlanName).toBeNull();
    expect(bus.request).not.toHaveBeenCalled();
  });

  it('does not overlap status requests while a previous read is pending', () => {
    const { component } = build('payment_pending');
    const pending = new Subject<any>();
    const read = (component as any).checkoutService.getCheckoutIntentStatus;
    read.and.returnValue(pending);
    component.loadStatus(); component.loadStatus();
    expect(read.calls.count()).toBe(1);
    pending.next({success:true,status:'PENDING'});
    component.loadStatus();
    expect(read.calls.count()).toBe(2);
    component.ngOnDestroy();
  });

});
