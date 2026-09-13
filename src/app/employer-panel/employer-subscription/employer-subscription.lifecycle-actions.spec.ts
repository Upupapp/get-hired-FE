import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CompanyFacade } from '@main/company/state/company.facade';
import { EmployerSubscriptionComponent } from './employer-subscription.component';
import { BillingService } from './services/billing.service';
import { SubscriptionGuardrailService } from './services/subscription-guardrail.service';
import { SubscriptionPricingCatalogService } from './services/subscription-pricing-catalog.service';
import { SubscriptionSummaryService } from './subscription-summary.service';
import { EmployerSubscriptionSummary } from './subscription.models';
import { PlanCatalogItem, PricingCatalog } from './subscription-v4.models';

/**
 * UI-01: the hero and the lifecycle banner are what an employer reaches when a trial
 * ends or a payment fails, and their recovery buttons were inert or a reload. These
 * render the real template for every status the summary can report and pin two
 * things: each rendered button is wired to a click handler, and each handler reaches
 * a destination (an upgrade route, a focused heading, or the billing support email).
 *
 * The summary fixtures follow the production summary endpoint: the current plan's
 * `code` still uses the legacy `premium` alias, and `recommendedPlan` is Growth unless
 * the employer is already on Growth, when it is null.
 */

type Status = EmployerSubscriptionSummary['currentPlan']['status'];

// Listing each status here is enforced by the compiler: a status added to the type
// fails the build until it has a row below.
const EVERY_STATUS: Record<Status, true> = {
  none: true, trialing: true, trial_ending_soon: true, active: true, manual: true,
  payment_failed: true, past_due: true, pending: true, cancelled: true, expired: true,
};

const EXPECTED_BUTTONS: Array<[Status, string | null, string[]]> = [
  ['none', null, ['Choose a plan', 'Compare plans']],
  ['trialing', 'free_trial', ['Upgrade now', 'Upgrade now']],
  ['trial_ending_soon', 'free_trial', ['Upgrade now', 'Upgrade now']],
  ['active', 'starter', ['Change plan']],
  ['manual', 'starter', ['Change plan']],
  ['payment_failed', 'starter', ['Contact billing support', 'Contact billing support']],
  ['past_due', 'starter', ['Contact billing support', 'Contact billing support']],
  ['pending', 'starter', []],
  ['cancelled', 'starter', ['Reactivate plan']],
  ['expired', 'starter', ['Choose a plan', 'Compare plans']],
];

function plan(slug: string, over: Partial<PlanCatalogItem> = {}): PlanCatalogItem {
  return {
    slug, name: slug, audience: '', recommended: false, trial: false, enterprise: false, current: false,
    upgradeRoute: `/recruiter/subscription/upgrade/${slug}`,
    defaultBillingCycle: 'monthly',
    pricing: {
      monthly: { amount: 100, currency: 'PHP', label: 'monthly price label', renewalLabel: 'Paid monthly' },
      annual: {
        amount: 1000, currency: 'PHP', dueTodayLabel: 'due today label', effectiveMonthlyLabel: 'effective monthly label',
        savingsCopy: null, annualSavingsAmount: 200, renewalLabel: 'Paid yearly',
      },
    },
    entitlements: {
      active_job_posts: 1, admin_users: 1, video_responses: 1,
      customized_company_page: false, video_interview_questions: false, dedicated_support: false,
    },
    ...over,
  };
}

const CATALOG: PricingCatalog = {
  annualCopy: '', mustDiscloseAnnualDueToday: true, upgradeLandingDefaultCycle: 'monthly',
  monthlyAvailable: true, annualAvailable: true,
  plans: [plan('free_trial', { trial: true, upgradeRoute: null }), plan('starter'), plan('growth', { recommended: true }), plan('business')],
};

function summaryFor(status: Status, code: string | null, recommendsGrowth: boolean): EmployerSubscriptionSummary {
  return {
    company: { id: 1, name: 'Acme Hiring' },
    currentPlan: { id: 1, code, name: 'Plan', status, currentPeriodEnd: '2026-10-13T00:00:00.000Z' },
    recommendedPlan: recommendsGrowth
      ? { planCode: 'growth', planName: 'Growth', reason: 'Best fit for growing teams.', benefits: [], ctaLabel: 'Upgrade to Growth' }
      : null,
    availablePlans: [],
    invoices: [],
  } as unknown as EmployerSubscriptionSummary;
}

interface RenderOptions {
  catalogFails?: boolean;
  summaryFails?: boolean;
  /** Defaults to the production rule: recommended unless already on Growth. */
  recommendsGrowth?: boolean;
}

describe('EmployerSubscriptionComponent -- hero and banner billing buttons (UI-01)', () => {
  let router: jasmine.SpyObj<Router>;
  let getSummary: jasmine.Spy;

  function render(status: Status, code: string | null, options: RenderOptions = {}): ComponentFixture<EmployerSubscriptionComponent> {
    // Reduced motion, so the plan carousel never starts its timer.
    spyOn(window, 'matchMedia').and.returnValue({ matches: true } as unknown as MediaQueryList);
    router = jasmine.createSpyObj<Router>('Router', ['navigate', 'navigateByUrl']);
    const recommendsGrowth = options.recommendsGrowth ?? code !== 'growth';
    getSummary = jasmine.createSpy('getSummary').and.returnValue(
      options.summaryFails ? throwError(new Error('summary unavailable')) : of(summaryFor(status, code, recommendsGrowth)));
    TestBed.configureTestingModule({
      declarations: [EmployerSubscriptionComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: CompanyFacade, useValue: { companyDetails$: of(null) } },
        { provide: SubscriptionSummaryService, useValue: { getSummary } },
        {
          provide: SubscriptionPricingCatalogService,
          useValue: { getCatalog: () => options.catalogFails ? throwError(new Error('catalog unavailable')) : of({ success: true, catalog: CATALOG }) },
        },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap({}) } } },
        { provide: MatDialog, useValue: {} },
        { provide: BillingService, useValue: {} },
        { provide: SubscriptionGuardrailService, useValue: { getSummary: () => of({ success: true, summary: { usage: {} } }) } },
      ],
    });
    const fixture = TestBed.createComponent(EmployerSubscriptionComponent);
    fixture.detectChanges();
    return fixture;
  }

  function lifecycleButtons(fixture: ComponentFixture<EmployerSubscriptionComponent>): DebugElement[] {
    return fixture.debugElement.queryAll(By.css('.gh-sub-hero button, .gh-sub-banner button'));
  }

  function button(fixture: ComponentFixture<EmployerSubscriptionComponent>, where: 'hero' | 'banner'): HTMLButtonElement {
    const found = fixture.debugElement.query(By.css(where === 'hero' ? '.gh-sub-hero button' : '.gh-sub-banner button'));
    expect(found).withContext(`no ${where} button rendered`).not.toBeNull();
    return found.nativeElement;
  }

  function label(el: DebugElement): string {
    return (el.nativeElement.textContent || '').trim();
  }

  function heading(fixture: ComponentFixture<EmployerSubscriptionComponent>, region: string): HTMLElement {
    return fixture.debugElement.query(By.css(`.gh-sub-section[aria-label="${region}"] h2`)).nativeElement;
  }

  it('has a row for every status the summary type allows', () => {
    expect(EXPECTED_BUTTONS.map(row => row[0] as string).sort()).toEqual(Object.keys(EVERY_STATUS).sort());
  });

  EXPECTED_BUTTONS.forEach(([status, code, labels]) => {
    const rendered = labels.length ? labels.map(l => `"${l}"`).join(' and ') : 'no button';
    it(`renders ${rendered} for status ${status}, each with a click handler that reaches a destination`, () => {
      const fixture = render(status, code);
      const component = fixture.componentInstance;
      const contact = spyOn(component, 'contactBillingSupport');
      const focus = spyOn(component, 'focusPlanSection');
      const destinations = () =>
        router.navigate.calls.count() + router.navigateByUrl.calls.count() + contact.calls.count() + focus.calls.count();

      const buttons = lifecycleButtons(fixture);
      expect(buttons.map(label)).toEqual(labels);
      buttons.forEach(el => {
        expect(el.listeners.some(l => l.name === 'click'))
          .withContext(`"${label(el)}" (${status}) has no click handler`).toBeTrue();
        const before = destinations();
        el.nativeElement.click();
        expect(destinations()).withContext(`"${label(el)}" (${status}) went nowhere`).toBe(before + 1);
      });
      expect(getSummary).withContext('a hero or banner button reloaded the summary').toHaveBeenCalledTimes(1);
    });
  });

  it('Upgrade now opens the recommended plan from both the hero and the banner', () => {
    const fixture = render('trialing', 'free_trial');
    button(fixture, 'hero').click();
    button(fixture, 'banner').click();
    expect(router.navigateByUrl.calls.allArgs()).toEqual([
      ['/recruiter/subscription/upgrade/growth'], ['/recruiter/subscription/upgrade/growth'],
    ]);
  });

  it('Choose a plan opens the lapsed plan when the backend sends no recommendation', () => {
    // The summary recommends nothing to an employer already on Growth. The old banner
    // handler, navigateToUpgrade(), returns silently for the current plan.
    const fixture = render('expired', 'growth');
    button(fixture, 'hero').click();
    expect(router.navigateByUrl).toHaveBeenCalledOnceWith('/recruiter/subscription/upgrade/growth');
  });

  it('Reactivate plan opens the lapsed plan, resolving the legacy premium code', () => {
    const fixture = render('cancelled', 'premium');
    button(fixture, 'hero').click();
    expect(router.navigateByUrl).toHaveBeenCalledOnceWith('/recruiter/subscription/upgrade/business');
  });

  it('Reactivate plan falls back to the slug route when the catalog could not load', () => {
    const fixture = render('cancelled', 'starter', { catalogFails: true });
    button(fixture, 'hero').click();
    expect(router.navigate).toHaveBeenCalledOnceWith(['/recruiter/subscription/upgrade', 'starter']);
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it('never routes an upgrade to the Free Trial; with no plan to open it goes to the plan cards', () => {
    const fixture = render('none', 'free_trial', { recommendsGrowth: false });
    const focus = spyOn(fixture.componentInstance, 'focusPlanSection');
    button(fixture, 'hero').click();
    expect(router.navigate).not.toHaveBeenCalled();
    expect(router.navigateByUrl).not.toHaveBeenCalled();
    expect(focus).toHaveBeenCalledOnceWith('plans');
  });

  it('Contact billing support replaces Fix payment and keeps the danger style', () => {
    const fixture = render('payment_failed', 'starter');
    const component = fixture.componentInstance;
    const contact = spyOn(component, 'contactBillingSupport');
    button(fixture, 'hero').click();
    button(fixture, 'banner').click();
    expect(contact).toHaveBeenCalledTimes(2);
    expect(button(fixture, 'banner').classList).toContain('gh-sub-banner__btn--danger');
    expect(component.billingSupportHref).toBe('mailto:support@gethired.ph?subject=GetHired%20billing%20support');
    expect(fixture.nativeElement.textContent).not.toContain('Fix payment');
  });

  it('Compare plans opens the Plan tab, scrolls to the Compare plans heading and focuses it', fakeAsync(() => {
    const fixture = render('none', null);
    tick();
    fixture.componentInstance.activeTab = 'billing-profile';
    fixture.detectChanges();
    const scroll = spyOn(Element.prototype, 'scrollIntoView');

    button(fixture, 'banner').click();
    fixture.detectChanges();
    tick();

    const target = heading(fixture, 'Compare plans');
    expect(fixture.componentInstance.activeTab).toBe('plan');
    expect(scroll.calls.mostRecent().object).toBe(target);
    expect(target.getAttribute('tabindex')).toBe('-1');
    expect(document.activeElement).toBe(target);
  }));

  it('Compare plans lands on Available plans when the catalog could not load, since Compare plans is not rendered', fakeAsync(() => {
    const fixture = render('expired', 'starter', { catalogFails: true });
    tick();
    button(fixture, 'banner').click();
    fixture.detectChanges();
    tick();
    expect(fixture.debugElement.query(By.css('.gh-sub-section[aria-label="Compare plans"]'))).toBeNull();
    expect(document.activeElement).toBe(heading(fixture, 'Available plans'));
  }));

  it('Change plan focuses Available plans, where the upgrade and switch actions are', fakeAsync(() => {
    const fixture = render('active', 'starter');
    tick();
    button(fixture, 'hero').click();
    fixture.detectChanges();
    tick();
    expect(document.activeElement).toBe(heading(fixture, 'Available plans'));
  }));

  (['payment_failed', 'past_due'] as Status[]).forEach(status => {
    it(`shows support@gethired.ph as text in the billing banner for status ${status}, so a device with no mail client can still reach billing`, () => {
      const fixture = render(status, 'starter');
      const line: string = fixture.debugElement.query(By.css('.gh-sub-banner__body')).nativeElement.textContent;
      expect(line).toContain('Contact billing support at support@gethired.ph');
      expect(line).not.toContain('payment method');
    });
  });

  it('keeps Retry under the error state as the one button that reloads', () => {
    const fixture = render('none', null, { summaryFails: true });
    expect(getSummary).toHaveBeenCalledTimes(1);
    fixture.debugElement.query(By.css('.gh-sub-error-state button')).nativeElement.click();
    expect(getSummary).toHaveBeenCalledTimes(2);
  });

  it('answers the failed-payment FAQ with the button the page renders and the same support address', () => {
    const fixture = render('payment_failed', 'starter');
    const component = fixture.componentInstance;
    const faq = component.visibleFaqItems.find(item => item.q === 'How do I fix a failed payment?');
    expect(faq).withContext('failed-payment FAQ missing').toBeDefined();
    expect(component.visibleFaqItems.filter(item => item.a.includes('Fix payment'))).toEqual([]);

    component.toggleFaq(faq!.q);
    fixture.detectChanges();
    const answer = fixture.debugElement.queryAll(By.css('.gh-faq-item__a')).map(el => label(el));
    expect(answer.length).toBe(1);
    expect(answer[0]).toContain('"Contact billing support"');
    expect(answer[0]).toContain(component.billingSupportHref.slice('mailto:'.length).split('?')[0]);
    expect(button(fixture, 'banner').textContent!.trim()).toBe('Contact billing support');
  });
});
