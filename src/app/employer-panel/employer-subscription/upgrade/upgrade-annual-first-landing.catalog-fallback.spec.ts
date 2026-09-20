import { convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import { UpgradeAnnualFirstLandingComponent } from './upgrade-annual-first-landing.component';

describe('UpgradeAnnualFirstLandingComponent catalog fallback', () => {
  function createComponent(planSlug = 'growth') {
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
    };
    const component = new UpgradeAnnualFirstLandingComponent(
      {
        snapshot: {
          paramMap: convertToParamMap({ planSlug }),
          queryParamMap: convertToParamMap({}),
        },
      } as any,
      {} as any,
      { getCatalog: () => throwError(() => new Error('catalog unavailable')) } as any,
      checkoutIntentService as any,
      {
        getRecommendation: () => throwError(() => new Error('recommendation unavailable')),
        recordEvent: jasmine.createSpy('recordEvent'),
      } as any,
      { markForCheck: jasmine.createSpy('markForCheck') } as any,
      'browser'
    );
    return { component, checkoutIntentService };
  }

  it('renders a known plan from the authoritative preview when the legacy catalog fails', () => {
    const { component, checkoutIntentService } = createComponent();

    component.ngOnInit();

    expect(component.loading).toBeFalse();
    expect(component.loadError).toBeFalse();
    expect(component.plan).toBeNull();
    expect(component.planName).toBe('Growth');
    expect(component.displayPrice).toBe('₱2,990');
    expect(component.dueTodayLabel).toBe('₱2,990.00 due today');
    expect(component.entitlementRows).toEqual([
      { label: 'Active job posts', value: '15' },
      { label: 'Admin users', value: '5' },
      { label: 'Recruitment Storage', value: '50 GB' },
      { label: 'Video questions per job', value: '5' },
    ]);
    expect(checkoutIntentService.previewUpgrade).toHaveBeenCalledOnceWith({
      planCode: 'growth', billingCycle: 'monthly',
    });
  });

  it('keeps an unknown plan route in the fatal error state', () => {
    const { component, checkoutIntentService } = createComponent('unknown');

    component.ngOnInit();

    expect(component.loadError).toBeTrue();
    expect(checkoutIntentService.previewUpgrade).not.toHaveBeenCalled();
  });
});
