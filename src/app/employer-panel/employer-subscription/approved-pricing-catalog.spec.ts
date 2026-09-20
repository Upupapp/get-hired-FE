import { APPROVED_PRICING_CATALOG } from './approved-pricing-catalog';

describe('approved pricing compatibility catalog', () => {
  it('contains the complete approved tier order and prices', () => {
    const plans = APPROVED_PRICING_CATALOG.plans;

    expect(plans.map(plan => plan.slug)).toEqual([
      'free_trial', 'starter', 'growth', 'business', 'enterprise',
    ]);
    expect(plans.map(plan => plan.pricing.monthly.amount)).toEqual([0, 1490, 3490, 6990, null]);
    expect(plans.map(plan => plan.pricing.annual.amount)).toEqual([0, 14900, 34900, 69900, null]);
  });

  it('keeps checkout routes canonical and Enterprise sales-led', () => {
    const bySlug = new Map(APPROVED_PRICING_CATALOG.plans.map(plan => [plan.slug, plan]));

    expect(bySlug.get('starter')?.upgradeRoute).toBe('/recruiter/subscription/upgrade/starter');
    expect(bySlug.get('growth')?.upgradeRoute).toBe('/recruiter/subscription/upgrade/growth');
    expect(bySlug.get('business')?.upgradeRoute).toBe('/recruiter/subscription/upgrade/business');
    expect(bySlug.get('enterprise')?.upgradeRoute).toBeNull();
    expect(bySlug.get('enterprise')?.contactSalesRequired).toBeTrue();
  });
});
