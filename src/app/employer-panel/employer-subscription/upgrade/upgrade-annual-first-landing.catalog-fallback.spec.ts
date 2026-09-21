import { convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import { UpgradeAnnualFirstLandingComponent } from './upgrade-annual-first-landing.component';

describe('UpgradeAnnualFirstLandingComponent catalog fallback', () => {
  function createComponent(planSlug = 'growth') {
    localStorage.removeItem('returnURL');
    const preview = {
      success: true,
      planVersionId: 'growth-v1',
      purchaseType: 'SUBSCRIPTION',
      amountMinor: 299000,
      currency: 'PHP' as const,
      billingCycle: 'monthly' as const,
      billingMode: 'UPFRONT' as const,
      entitlements: { jobs: 15, users: 5, storage: 50000000000, video: 5 },
      proration: false as const,
    };
    const checkoutIntentService = {
      previewUpgrade: jasmine.createSpy('previewUpgrade').and.returnValue(of(preview)),
      createCheckoutIntent: jasmine.createSpy('createCheckoutIntent').and.returnValue(of({ success: false })),
    };
    const router = { navigateByUrl: jasmine.createSpy('navigateByUrl'), navigate: jasmine.createSpy('navigate') };
    const coreService = { discardExpiredSession: jasmine.createSpy('discardExpiredSession') };
    const component = new UpgradeAnnualFirstLandingComponent(
      {
        snapshot: {
          paramMap: convertToParamMap({ planSlug }),
          queryParamMap: convertToParamMap({}),
        },
      } as any,
      router as any,
      { getCatalog: () => throwError(() => new Error('catalog unavailable')) } as any,
      checkoutIntentService as any,
      {
        getRecommendation: () => throwError(() => new Error('recommendation unavailable')),
        recordEvent: jasmine.createSpy('recordEvent'),
      } as any,
      coreService as any,
      { markForCheck: jasmine.createSpy('markForCheck') } as any,
      'browser'
    );
    return { component, checkoutIntentService, router, coreService };
  }

  it('renders a known plan from the authoritative preview when the legacy catalog fails', () => {
    const { component, checkoutIntentService } = createComponent();

    component.ngOnInit();

    expect(component.loading).toBeFalse();
    expect(component.loadError).toBeFalse();
    expect(component.plan?.slug).toBe('growth');
    expect(component.planName).toBe('Growth');
    expect(component.displayPrice).toBe('₱2,990');
    expect(component.dueTodayLabel).toBe('₱2,990.00 due today');
    expect(component.entitlementRows).toEqual([
      { label: 'Active job posts', value: '15' },
      { label: 'Team users', value: '5' },
      { label: 'Recruitment storage', value: '50 GB' },
      { label: 'Video questions per job', value: '5' },
    ]);
    expect(checkoutIntentService.previewUpgrade).toHaveBeenCalledOnceWith({
      planCode: 'growth', billingCycle: 'monthly',
    });
  });

  it('keeps catalog question and storage limits when a legacy preview uses response limits and binary bytes', () => {
    const { component, checkoutIntentService } = createComponent();
    checkoutIntentService.previewUpgrade.and.returnValue(of({
      success: true, planVersionId: 'growth-legacy', purchaseType: 'SUBSCRIPTION',
      amountMinor: 349000, currency: 'PHP', billingCycle: 'monthly', billingMode: 'UPFRONT',
      entitlements: { jobs: 15, users: 5, storage: 53687091200, video: 100 }, proration: false,
    }));
    component.ngOnInit();
    expect(component.entitlementRows).toEqual([
      { label: 'Active job posts', value: '15' },
      { label: 'Team users', value: '5' },
      { label: 'Recruitment storage', value: '50 GB' },
      { label: 'Video questions per job', value: '5' },
    ]);
  });

  it('keeps an unknown plan route in the fatal error state', () => {
    const { component, checkoutIntentService } = createComponent('unknown');

    component.ngOnInit();

    expect(component.loadError).toBeTrue();
    expect(checkoutIntentService.previewUpgrade).not.toHaveBeenCalled();
  });

  it('allows the server-authoritative checkout request when preview is unavailable', () => {
    const { component, checkoutIntentService } = createComponent('growth');
    component.ngOnInit();
    component.preview = null;
    component.previewLoading = false;

    component.startCheckout();

    expect(checkoutIntentService.createCheckoutIntent).toHaveBeenCalledWith(jasmine.objectContaining({
      planCode: 'growth', billingCycle: 'monthly',
    }));
  });

  it('shows a stable sign-in action for an expired checkout session', () => {
    const { component, checkoutIntentService, router, coreService } = createComponent('growth');
    checkoutIntentService.createCheckoutIntent.and.returnValue(throwError(() => ({ status: 401 })));
    component.ngOnInit();
    component.previewLoading = false;

    component.startCheckout();

    expect(coreService.discardExpiredSession).toHaveBeenCalledTimes(1);
    expect(router.navigateByUrl).not.toHaveBeenCalled();
    expect(component.sessionExpired).toBeTrue();
    expect(component.checkoutError).toContain('session has expired');
    expect(router.navigate).toHaveBeenCalledWith(['/signin'], { queryParams: { role: 2 } });

    router.navigate.calls.reset();
    component.signIn();
    expect(localStorage.getItem('returnURL')).toBe('/recruiter/subscription/upgrade/growth?billing=monthly');
    expect(router.navigate).toHaveBeenCalledWith(['/signin'], { queryParams: { role: 2 } });

    component.startCheckout();
    expect(checkoutIntentService.createCheckoutIntent).toHaveBeenCalledTimes(1);
    expect(router.navigate).toHaveBeenCalledWith(['/signin'], { queryParams: { role: 2 } });
  });
});
