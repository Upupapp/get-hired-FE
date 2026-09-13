import { Component, DebugElement, NgZone, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable, Subject, of, throwError } from 'rxjs';
import { CompanyFacade } from '@main/company/state/company.facade';
import { EmployerSubscriptionComponent } from './employer-subscription.component';
import { BillingService } from './services/billing.service';
import { SubscriptionGuardrailService } from './services/subscription-guardrail.service';
import { SubscriptionPricingCatalogService } from './services/subscription-pricing-catalog.service';
import { SubscriptionSummaryService } from './subscription-summary.service';
import { EmployerSubscriptionSummary } from './subscription.models';
import { PlanCatalogItem, PricingCatalog, PricingCatalogResponse } from './subscription-v4.models';
import { UpgradeAnnualFirstLandingComponent } from './upgrade/upgrade-annual-first-landing.component';

/**
 * B2.1: the upgrade landing's "Compare all plans" opens this page as ?compare=1, and
 * the page has to take the employer to Compare plans. That heading renders only once
 * the summary and the catalog have both loaded, so one spec holds both requests open
 * and checks that focus waits for them. Another drives the real goCompare() through
 * the real Router, so a renamed parameter or path on either side turns it red.
 */

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

const SUMMARY = {
  company: { id: 1, name: 'Acme Hiring' },
  currentPlan: { id: 2, code: 'starter', name: 'Starter', status: 'active', currentPeriodEnd: '2026-10-13T00:00:00.000Z' },
  recommendedPlan: null,
  availablePlans: [],
  invoices: [],
} as unknown as EmployerSubscriptionSummary;

@Component({ template: '<router-outlet></router-outlet>' })
class OutletHostComponent {}

describe('EmployerSubscriptionComponent -- the landing\'s "Compare all plans" link (B2.1)', () => {
  let scroll: jasmine.Spy;

  beforeEach(() => {
    // Reduced motion, so the plan carousel never starts its timer.
    spyOn(window, 'matchMedia').and.returnValue({ matches: true } as unknown as MediaQueryList);
    scroll = spyOn(Element.prototype, 'scrollIntoView');
  });

  function pageProviders(summary$: Observable<EmployerSubscriptionSummary>, catalog$: Observable<PricingCatalogResponse>): any[] {
    return [
      { provide: CompanyFacade, useValue: { companyDetails$: of(null) } },
      { provide: SubscriptionSummaryService, useValue: { getSummary: () => summary$ } },
      { provide: SubscriptionPricingCatalogService, useValue: { getCatalog: () => catalog$ } },
      { provide: SubscriptionGuardrailService, useValue: { getSummary: () => of({ success: true, summary: { usage: {} } }) } },
      { provide: MatDialog, useValue: {} },
      { provide: BillingService, useValue: {} },
    ];
  }

  function renderPage(query: { [key: string]: string },
                      summary$: Observable<EmployerSubscriptionSummary>,
                      catalog$: Observable<PricingCatalogResponse>): ComponentFixture<EmployerSubscriptionComponent> {
    TestBed.configureTestingModule({
      declarations: [EmployerSubscriptionComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        ...pageProviders(summary$, catalog$),
        { provide: Router, useValue: jasmine.createSpyObj<Router>('Router', ['navigate', 'navigateByUrl']) },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap(query) } } },
      ],
    });
    const fixture = TestBed.createComponent(EmployerSubscriptionComponent);
    fixture.detectChanges();
    return fixture;
  }

  function sectionHeading(root: DebugElement, region: string): HTMLElement | null {
    const found = root.query(By.css(`.gh-sub-section[aria-label="${region}"] h2`));
    return found ? found.nativeElement : null;
  }

  it('?compare=1 focuses the Compare plans heading, and waits until the summary and the catalog have both loaded', fakeAsync(() => {
    const summary$ = new Subject<EmployerSubscriptionSummary>();
    const catalog$ = new Subject<PricingCatalogResponse>();
    const fixture = renderPage({ compare: '1' }, summary$, catalog$);
    tick();
    expect(scroll).not.toHaveBeenCalled();

    summary$.next(SUMMARY);
    fixture.detectChanges();
    tick();
    expect(scroll).withContext('focus moved before the catalog loaded, when Compare plans cannot exist yet').not.toHaveBeenCalled();

    catalog$.next({ success: true, catalog: CATALOG });
    fixture.detectChanges();
    tick();
    const heading = sectionHeading(fixture.debugElement, 'Compare plans');
    expect(heading).withContext('Compare plans did not render').not.toBeNull();
    expect(heading!.getAttribute('tabindex')).toBe('-1');
    expect(scroll.calls.mostRecent().object).toBe(heading);
    expect(document.activeElement).toBe(heading);
  }));

  it('without ?compare=1 the page moves no focus and scrolls nowhere', fakeAsync(() => {
    const fixture = renderPage({}, of(SUMMARY), of({ success: true, catalog: CATALOG }));
    fixture.detectChanges();
    tick();
    expect(sectionHeading(fixture.debugElement, 'Compare plans')).not.toBeNull();
    expect(scroll).not.toHaveBeenCalled();
    expect(document.activeElement).not.toBe(sectionHeading(fixture.debugElement, 'Compare plans'));
  }));

  it('?compare=1 lands on Available plans when the catalog could not load, since Compare plans is not rendered', fakeAsync(() => {
    const fixture = renderPage({ compare: '1' }, of(SUMMARY), throwError(new Error('catalog unavailable')));
    fixture.detectChanges();
    tick();
    expect(sectionHeading(fixture.debugElement, 'Compare plans')).toBeNull();
    expect(document.activeElement).toBe(sectionHeading(fixture.debugElement, 'Available plans'));
  }));

  it('the landing\'s goCompare() navigates here through the real Router and focuses Compare plans', fakeAsync(() => {
    TestBed.configureTestingModule({
      declarations: [OutletHostComponent, EmployerSubscriptionComponent],
      // The app mounts the page at recruiter (app.routing.module.ts) → subscription
      // (employer-panel.module.ts) → '' (employer-subscription.module.ts).
      imports: [RouterTestingModule.withRoutes([{ path: 'recruiter/subscription', component: EmployerSubscriptionComponent }])],
      schemas: [NO_ERRORS_SCHEMA],
      providers: pageProviders(of(SUMMARY), of({ success: true, catalog: CATALOG })),
    });
    const fixture = TestBed.createComponent(OutletHostComponent);
    const router = TestBed.inject(Router);
    const landing = new UpgradeAnnualFirstLandingComponent(
      TestBed.inject(ActivatedRoute), router, {} as any, {} as any, {} as any, {} as any, 'browser');

    TestBed.inject(NgZone).run(() => landing.goCompare());
    tick();
    fixture.detectChanges();
    tick();

    expect(router.url).toBe('/recruiter/subscription?compare=1');
    const page = fixture.debugElement.query(By.directive(EmployerSubscriptionComponent));
    expect(page).withContext('the route did not activate the subscription page').not.toBeNull();
    const heading = sectionHeading(page, 'Compare plans');
    expect(heading).withContext('Compare plans did not render').not.toBeNull();
    expect(document.activeElement).toBe(heading);
  }));
});
