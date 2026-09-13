import { of, throwError } from 'rxjs';
import { EngagementRefreshBus } from '@main/shared/engagement/engagement-refresh.bus';
import { CheckoutReturnStatusComponent } from './checkout-return-status.component';

/** F1: a checkout return that settled changed the subscription, so the engagement context is read again. */
describe('CheckoutReturnStatusComponent -- a settled checkout return reads the engagement context again (F1)', () => {
  function build(answer: string | Error): { component: CheckoutReturnStatusComponent; bus: EngagementRefreshBus } {
    const bus = new EngagementRefreshBus();
    spyOn(bus, 'request');
    const lifecycle = {
      getCheckoutReturnStatus: jasmine.createSpy('getCheckoutReturnStatus').and.returnValue(answer instanceof Error
        ? throwError(() => answer)
        : of({ success: true, checkoutIntentId: 'CI-1', returnStatus: answer, billingCycle: 'monthly', userMessage: '', lifecycle: null })),
    };
    const component = new CheckoutReturnStatusComponent({} as any, {} as any, lifecycle as any, { markForCheck: () => {} } as any, bus);
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
});
