import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, discardPeriodicTasks, fakeAsync, tick } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { Observable, Subject, of } from 'rxjs';
import { CompanyFacade } from '@main/company/state/company.facade';
import { EmployerSubscriptionComponent } from './employer-subscription.component';
import { BillingService } from './services/billing.service';
import { SubscriptionGuardrailService } from './services/subscription-guardrail.service';
import { SubscriptionPricingCatalogService } from './services/subscription-pricing-catalog.service';
import { SubscriptionSummaryService } from './subscription-summary.service';
import { EmployerSubscriptionSummary } from './subscription.models';
import { PlanCatalogItem, PricingCatalog, PricingCatalogResponse } from './subscription-v4.models';

/**
 * WCAG 2.2.2 guard for the auto-advancing plan carousel: moving content needs a
 * way to pause it, and that pause must hold.
 *
 * The component is constructed directly rather than through TestBed. These specs
 * exercise the timer and pause state, not the template, and none of the injected
 * services are touched on these paths.
 */
describe('EmployerSubscriptionComponent -- carousel pause control (WCAG 2.2.2)', () => {

  function create(reducedMotion: boolean): { component: EmployerSubscriptionComponent; advance: jasmine.Spy } {
    spyOn(window, 'matchMedia').and.returnValue({ matches: reducedMotion } as unknown as MediaQueryList);
    const component = new EmployerSubscriptionComponent(
      {} as any, {} as any, {} as any, {} as any, {} as any, {} as any, {} as any, {} as any,
    );
    const advance = spyOn(component, 'advancePlanCarousel');
    return { component, advance };
  }

  function start(component: EmployerSubscriptionComponent): void {
    (component as any).startPlanCarouselAutoScroll();
  }

  it('advances on its own when nothing has paused it', fakeAsync(() => {
    const { component, advance } = create(false);
    start(component);
    tick(2000);
    expect(advance).toHaveBeenCalledTimes(1);
    discardPeriodicTasks();
  }));

  it('does not advance while the explicit pause is on', fakeAsync(() => {
    const { component, advance } = create(false);
    start(component);
    component.togglePlanCarouselAutoAdvance();
    tick(10000);
    expect(advance).not.toHaveBeenCalled();
    discardPeriodicTasks();
  }));

  it('resumes once the explicit pause is released', fakeAsync(() => {
    const { component, advance } = create(false);
    start(component);
    component.togglePlanCarouselAutoAdvance();
    component.togglePlanCarouselAutoAdvance();
    tick(2000);
    expect(advance).toHaveBeenCalledTimes(1);
    discardPeriodicTasks();
  }));

  it('keeps an explicit pause after a hover or touch ends', fakeAsync(() => {
    // The transient pause resumes itself 3s after an interaction ends. Before this
    // fix there was only that transient pause, so nothing could stop the rotation.
    const { component, advance } = create(false);
    start(component);
    component.togglePlanCarouselAutoAdvance();
    component.onPlanCarouselInteractionStart();
    component.onPlanCarouselInteractionEnd();
    tick(3000);
    tick(6000);
    expect(advance).not.toHaveBeenCalled();
    discardPeriodicTasks();
  }));

  it('offers the control only when the carousel is allowed to move', () => {
    const moving = create(false).component;
    expect(moving.planCarouselMotionAllowed).toBeTrue();
    (window.matchMedia as jasmine.Spy).and.returnValue({ matches: true } as unknown as MediaQueryList);
    expect(moving.planCarouselMotionAllowed).toBeFalse();
  });

  it('never starts rotating for a reduced-motion user', fakeAsync(() => {
    const { component, advance } = create(true);
    start(component);
    tick(10000);
    expect(advance).not.toHaveBeenCalled();
    discardPeriodicTasks();
  }));
});

/**
 * U1 polish (B3.2): the pause control is for movement, so it shows only while the plan track
 * can scroll. Cards keep a fixed width at every breakpoint, so that is a layout fact, not a
 * breakpoint: the ≤768px dots are not the rule. The track renders only after the catalog
 * loads, so the page has to measure it then.
 */
describe('EmployerSubscriptionComponent -- the pause control follows whether the plan track can move', () => {
  function plan(slug: string): PlanCatalogItem {
    return {
      slug, name: slug, audience: '', recommended: false, trial: false, enterprise: false, current: false,
      upgradeRoute: `/recruiter/subscription/upgrade/${slug}`, defaultBillingCycle: 'monthly',
      pricing: {
        monthly: { amount: 100, currency: 'PHP', label: 'monthly price label', renewalLabel: 'Paid monthly' },
        annual: { amount: 1000, currency: 'PHP', dueTodayLabel: 'due today label', effectiveMonthlyLabel: 'effective monthly label',
          savingsCopy: null, annualSavingsAmount: 200, renewalLabel: 'Paid yearly' },
      },
      entitlements: { active_job_posts: 1, admin_users: 1, video_responses: 1,
        customized_company_page: false, video_interview_questions: false, dedicated_support: false },
    };
  }
  const CATALOG: PricingCatalog = {
    annualCopy: '', mustDiscloseAnnualDueToday: true, upgradeLandingDefaultCycle: 'monthly',
    monthlyAvailable: true, annualAvailable: true, plans: ['starter', 'growth', 'business'].map(plan),
  };
  const SUMMARY = {
    company: { id: 1, name: 'Acme Hiring' },
    currentPlan: { id: 2, code: 'starter', name: 'Starter', status: 'active', currentPeriodEnd: '2026-10-13T00:00:00.000Z' },
    recommendedPlan: null, availablePlans: [], invoices: [],
  } as unknown as EmployerSubscriptionSummary;

  function render(catalog$: Observable<PricingCatalogResponse>): ComponentFixture<EmployerSubscriptionComponent> {
    // Motion allowed: the control is only ever offered then.
    spyOn(window, 'matchMedia').and.returnValue({ matches: false } as unknown as MediaQueryList);
    TestBed.configureTestingModule({
      declarations: [EmployerSubscriptionComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: CompanyFacade, useValue: { companyDetails$: of(null) } },
        { provide: SubscriptionSummaryService, useValue: { getSummary: () => of(SUMMARY) } },
        { provide: SubscriptionPricingCatalogService, useValue: { getCatalog: () => catalog$ } },
        { provide: SubscriptionGuardrailService, useValue: { getSummary: () => of({ success: true, summary: { usage: {} } }) } },
        { provide: Router, useValue: jasmine.createSpyObj<Router>('Router', ['navigate', 'navigateByUrl']) },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap({}) } } },
        { provide: MatDialog, useValue: {} },
        { provide: BillingService, useValue: {} },
      ],
    });
    const fixture = TestBed.createComponent(EmployerSubscriptionComponent);
    fixture.detectChanges();
    return fixture;
  }

  const pauseControl = (fixture: ComponentFixture<EmployerSubscriptionComponent>) =>
    fixture.debugElement.query(By.css('.gh-plan-carousel__autoplay'));

  function withTrack(fixture: ComponentFixture<EmployerSubscriptionComponent>, canScrollPrev: boolean, canScrollNext: boolean): void {
    tick();
    fixture.componentInstance.planCarouselCanScrollPrev = canScrollPrev;
    fixture.componentInstance.planCarouselCanScrollNext = canScrollNext;
    fixture.detectChanges();
  }

  it('measures the plan track once the catalog has rendered it, and starts watching its size', fakeAsync(() => {
    const catalog$ = new Subject<PricingCatalogResponse>();
    const fixture = render(catalog$);
    tick();
    const component = fixture.componentInstance;
    expect((component as any).planCarouselResizeObserver).withContext('nothing to watch before the catalog').toBeUndefined();
    const measure = spyOn(component as any, 'syncScrollBoundaryState').and.callThrough();

    catalog$.next({ success: true, catalog: CATALOG });
    fixture.detectChanges();
    tick();

    expect(measure).toHaveBeenCalled();
    expect((component as any).planCarouselResizeObserver).withContext('the rendered track is not watched').toBeDefined();
    discardPeriodicTasks();
  }));

  it('hides the pause control while the track cannot scroll, since nothing moves', fakeAsync(() => {
    const fixture = render(of({ success: true, catalog: CATALOG }));
    withTrack(fixture, false, false);
    expect(pauseControl(fixture)).toBeNull();
    discardPeriodicTasks();
  }));

  it('shows the pause control whenever the track can scroll, at any width', fakeAsync(() => {
    const fixture = render(of({ success: true, catalog: CATALOG }));
    withTrack(fixture, false, true);
    expect(pauseControl(fixture)).withContext('can scroll forward').not.toBeNull();
    withTrack(fixture, true, false);
    expect(pauseControl(fixture)).withContext('can scroll back').not.toBeNull();
    discardPeriodicTasks();
  }));
});
