import { EmployerSubscriptionComponent } from './employer-subscription.component';

describe('Internal complimentary subscription presentation', () => {
  function page(internal: boolean): EmployerSubscriptionComponent {
    const component = new EmployerSubscriptionComponent(
      {} as any, {} as any, {} as any, {} as any,
      {} as any, {} as any, {} as any, {} as any,
    );
    component.summary = {
      currentPlan: {code: 'premium', name: 'Premium', status: 'active', isPaid: false,
        accessKind: internal ? 'internal_complimentary' : 'standard', isComplimentary: internal},
    } as any;
    return component;
  }
  it('retains Premium identity without a paid flag and suppresses purchase prompts', () => {
    const component = page(true);
    expect(component.currentPlanName).toBe('Premium');
    expect(component.currentPlanSlug).toBe('business');
    expect(component.statusLabel).toBe('Internal / Complimentary');
    expect(component.recommendedCatalogPlan).toBeNull();
    expect(component.canToggleBillingCycle).toBeFalse();
    component.catalogPlans.forEach(plan => expect(component.ctaFor(plan).actionable).toBeFalse());
    // Constructor mocks deliberately have no checkout method: this must return before invoking billing.
    expect(() => component.startStorageCheckout('storage_25')).not.toThrow();
  });
  it('does not infer complimentary access from being unpaid', () => {
    const component = page(false);
    expect(component.isComplimentary).toBeFalse();
    expect(component.statusLabel).toBe('Active');
    expect(component.canToggleBillingCycle).toBeTrue();
    expect(component.recommendedCatalogPlan).not.toBeNull();
  });
});
