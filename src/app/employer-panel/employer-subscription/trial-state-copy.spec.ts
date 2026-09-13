import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CompanyFacade } from '@main/company/state/company.facade';
import { CompanyDashboardComponent } from '@main/company/company-dashboard/company-dashboard.component';
import { EmployerSubscriptionComponent } from './employer-subscription.component';
import { BillingService } from './services/billing.service';
import { SubscriptionGuardrailService } from './services/subscription-guardrail.service';
import { SubscriptionPricingCatalogService } from './services/subscription-pricing-catalog.service';
import { SubscriptionSummaryService } from './subscription-summary.service';
import { EmployerSubscriptionSummary } from './subscription.models';
import { UpgradeAnnualFirstLandingComponent } from './upgrade/upgrade-annual-first-landing.component';

/**
 * B6.1 (gh-ui U5): every string an employer reads about a trial ending, read through the code that
 * shows it. gh-be's committed code pauses, deactivates, hides and removes nothing at trial end, and
 * whether applications keep arriving is unconfirmed. So no string may say anything is kept
 * "active", speak of keeping or losing "access", mention pausing, or promise applications keep coming.
 */
const FORBIDDEN = /keep[^.]*\bactive\b|losing access|lose access|keep access|paus|keep receiving applications|applications keep/i;

const REPLACED: { [where: string]: string } = {
  'FAQ at B6': 'Your published jobs stay published and keep receiving applications. To publish or reopen jobs, add team members or add screening questions, choose a plan.',
  'FAQ before B6': 'When your free trial expires, your active job posts will be paused and you will lose access to paid features.',
  'trialing banner': 'Upgrade to keep access.',
  'trial-ending banner': 'Upgrade now to avoid losing access to your hiring tools.',
  'dashboard trial_expired': 'Choose a plan to keep your jobs active and manage applicants.',
  'dashboard trial_ending': 'Upgrade now to keep your jobs, applicants, and video responses active.',
  'landing trial_ending': 'Your free trial is ending soon. Upgrade to keep your company page, job posts, and video interviews active.',
};

describe('Trial-state copy -- says only what the backend does at trial end (B6.1)', () => {
  it('the check catches every string it replaced (each old string is its own control)', () => {
    Object.keys(REPLACED).forEach(where => expect(FORBIDDEN.test(REPLACED[where])).withContext(where).toBeTrue());
  });

  it('the FAQ answer: published jobs stay published, and what a plan unlocks', () => {
    const page = new EmployerSubscriptionComponent({} as any, {} as any, {} as any, {} as any, {} as any, {} as any, {} as any, {} as any);
    const item = ((page as any).faqItems as Array<{ q: string; a: string }>).find(entry => entry.q === 'What happens when my free trial ends?');
    expect(item!.a).toBe('Your published jobs stay published. Choose a plan to publish or reopen jobs, add team members, or add screening questions.');
    expect(FORBIDDEN.test(item!.a)).toBeFalse();
  });

  function bannerText(status: 'trialing' | 'trial_ending_soon'): string {
    spyOn(window, 'matchMedia').and.returnValue({ matches: true } as unknown as MediaQueryList);
    const summary = {
      company: { id: 1, name: 'Acme Hiring' },
      currentPlan: { id: 1, code: 'free_trial', name: 'Free Trial', status, currentPeriodEnd: '2026-09-20T00:00:00.000Z', trialEndsAt: '2026-09-20T00:00:00.000Z' },
      recommendedPlan: null, availablePlans: [], invoices: [],
    } as unknown as EmployerSubscriptionSummary;
    TestBed.configureTestingModule({
      declarations: [EmployerSubscriptionComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: CompanyFacade, useValue: { companyDetails$: of(null) } },
        { provide: SubscriptionSummaryService, useValue: { getSummary: () => of(summary) } },
        { provide: SubscriptionPricingCatalogService, useValue: { getCatalog: () => throwError(new Error('catalog not under test')) } },
        { provide: SubscriptionGuardrailService, useValue: { getSummary: () => of({ success: true, summary: { usage: {} } }) } },
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']) },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap({}) } } },
        { provide: MatDialog, useValue: {} },
        { provide: BillingService, useValue: {} },
      ],
    });
    const fixture = TestBed.createComponent(EmployerSubscriptionComponent);
    fixture.detectChanges();
    return (fixture.nativeElement.querySelector('.gh-sub-banner__body').textContent || '').replace(/\s+/g, ' ').trim();
  }

  it('the trialing banner, as rendered', () => {
    const text = bannerText('trialing');
    expect(text).toContain('Choose a plan to keep publishing jobs');
    expect(FORBIDDEN.test(text)).withContext(text).toBeFalse();
  });

  it('the trial-ending banner, as rendered', () => {
    const text = bannerText('trial_ending_soon');
    expect(text).toContain('Your published jobs stay published');
    expect(FORBIDDEN.test(text)).withContext(text).toBeFalse();
  });

  it('the dashboard nudge for trial_expired and trial_ending', () => {
    const dashboard = Object.create(CompanyDashboardComponent.prototype) as CompanyDashboardComponent;
    (dashboard as any).upgradeRec = { copyKey: 'trial_expired' };
    const expired = dashboard.upgradeNudgeCopy.sub;
    expect(expired).toContain('Your published jobs stay published');
    (dashboard as any).upgradeRec = { copyKey: 'trial_ending' };
    const ending = dashboard.upgradeNudgeCopy.sub;
    [expired, ending].forEach(sub => expect(FORBIDDEN.test(sub)).withContext(sub).toBeFalse());
  });

  it('the upgrade landing: trial_ending rewritten, trial_expired left as it was (accurate)', () => {
    const landing = Object.create(UpgradeAnnualFirstLandingComponent.prototype) as UpgradeAnnualFirstLandingComponent;
    (landing as any).recommendation = { copyKey: 'trial_ending' };
    const ending = landing.heroSubtitle;
    (landing as any).recommendation = { copyKey: 'trial_expired' };
    const expired = landing.heroSubtitle;
    expect(expired).toBe('Your free trial has ended. Choose a plan to keep publishing jobs.');
    [ending, expired].forEach(subtitle => expect(FORBIDDEN.test(subtitle)).withContext(subtitle).toBeFalse());
  });
});
