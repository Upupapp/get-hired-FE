import { EmployerSubscriptionComponent } from './employer-subscription.component';

describe('EmployerSubscriptionComponent record-backed pricing fallback', () => {
  function component(): EmployerSubscriptionComponent {
    return new EmployerSubscriptionComponent(
      {} as any, {} as any, {} as any, {} as any,
      {} as any, {} as any, {} as any, {} as any,
    );
  }

  it('maps only the plans and prices returned by the employer summary', () => {
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

    expect(page.catalogPlans.map(plan => plan.slug)).toEqual(['free_trial', 'growth']);
    expect(page.catalogPlans[1].pricing.monthly.amount).toBe(3490);
    expect(page.catalogPlans[1].upgradeRoute).toBe('/recruiter/subscription/upgrade/growth');
    expect(page.catalogPlans[1].entitlements.active_job_posts).toBe(15);
    expect(page.catalogPlans[1].entitlements.video_responses).toBeNull();
    expect(page.recommendedCatalogPlan?.slug).toBe('growth');
  });
});
