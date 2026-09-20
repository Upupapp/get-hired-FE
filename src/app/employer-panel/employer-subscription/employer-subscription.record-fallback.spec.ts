import { EmployerSubscriptionComponent } from './employer-subscription.component';

describe('EmployerSubscriptionComponent record-backed pricing fallback', () => {
  function component(): EmployerSubscriptionComponent {
    return new EmployerSubscriptionComponent(
      {} as any, {} as any, {} as any, {} as any,
      {} as any, {} as any, {} as any, {} as any,
    );
  }

  it('stitches partial employer records into the complete approved catalog', () => {
    const page = component();
    page.summary = {
      currentPlan: { code: 'free_trial', name: 'Free Trial', status: 'trialing' },
      availablePlans: [
        {
          id: 1, code: 'free_trial', name: 'Free Trial', description: '', audience: 'Trial',
          priceMonthly: 0, currency: 'PHP', current: true, trial: true,
          features: [], limits: { activeJobs: 1, adminUsers: 1, videoResponses: 1 },
          ctaLabel: 'Current plan', ctaAction: 'current',
        },
        {
          id: 3, code: 'growth', name: 'Growth', description: '', audience: 'Growing teams',
          priceMonthly: 3490, currency: 'PHP', recommended: true,
          features: [{ key: 'company_page', label: 'Company page', included: true }],
          limits: { activeJobs: 15, adminUsers: 5, videoResponses: 'unlimited' },
          ctaLabel: 'Upgrade', ctaAction: 'upgrade',
        },
      ],
    } as any;

    expect(page.catalogPlans.map(plan => plan.slug)).toEqual(['free_trial', 'starter', 'growth', 'business', 'enterprise']);
    expect(page.catalogPlans[1].pricing.monthly.amount).toBe(1490);
    expect(page.catalogPlans[2].pricing.monthly.amount).toBe(3490);
    expect(page.catalogPlans[2].pricing.annual.amount).toBe(34900);
    expect(page.catalogPlans[2].upgradeRoute).toBe('/recruiter/subscription/upgrade/growth');
    expect(page.catalogPlans[2].entitlements.active_job_posts).toBe(15);
    expect(page.catalogPlans[2].entitlements.recruitment_storage_bytes).toBe(50 * 1024 * 1024 * 1024);
    expect(page.catalogPlans[3].pricing.monthly.amount).toBe(6990);
    expect(page.catalogPlans[4].contactSalesRequired).toBeTrue();
    expect(page.catalogPlans[0].current).toBeTrue();
    expect(page.recommendedCatalogPlan?.slug).toBe('growth');
  });

  it('renders all approved plans even when the summary has no availablePlans array', () => {
    const page = component();
    page.summary = { currentPlan: { code: 'starter', name: 'Starter', status: 'active' } } as any;

    expect(page.catalogPlans.length).toBe(5);
    expect(page.catalogPlans.find(plan => plan.slug === 'starter')?.current).toBeTrue();
  });
});
