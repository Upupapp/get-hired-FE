import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { CompanyFacade } from '@main/company/state/company.facade';
import { SubscriptionUsageMeterComponent } from './components/subscription-usage-meter/subscription-usage-meter.component';
import { EmployerSubscriptionComponent } from './employer-subscription.component';
import { BillingService } from './services/billing.service';
import { SubscriptionGuardrailService } from './services/subscription-guardrail.service';
import { SubscriptionPricingCatalogService } from './services/subscription-pricing-catalog.service';
import { SubscriptionSummaryService } from './subscription-summary.service';
import { EmployerSubscriptionSummary } from './subscription.models';
import { RecruitmentStorageUsageV4, StorageStatus, SubscriptionSummaryResponse } from './subscription-v4.models';

/**
 * B3: on the subscription page the Recruitment Storage meter is driven only by the
 * `usage.recruitment_storage` block of GET /api/subscriptions/employer/summary (A2). A
 * backend that predates the block sends no key, and then no meter renders: absent is
 * not zero, the rule the pricing page already follows for catalog fields.
 */
const GB = 1024 * 1024 * 1024;

function storageBlock(storageStatus: StorageStatus): RecruitmentStorageUsageV4 {
  const percent = { normal: 40, notice: 74, warning: 80, critical: 92, full: 100 }[storageStatus];
  return {
    key: 'recruitment_storage', used: (percent / 2) * GB, limit: 50 * GB, remaining: (50 - percent / 2) * GB, percentUsed: percent,
    warningLevel: percent >= 100 ? 'at_limit' : percent >= 90 ? 'near_90' : percent >= 70 ? 'near_70' : 'none',
    storageStatus, countSource: 'stored_media.active', countConfidence: 'confirmed',
  };
}

// What a backend without A2 sends: the sibling meters and no recruitment_storage key.
const SIBLING_METER = {
  key: 'active_job_posts', used: 3, limit: 15, remaining: 12, percentUsed: 20,
  warningLevel: 'none', countSource: 'jobs.status', countConfidence: 'confirmed',
};

function v4Response(usage: object): SubscriptionSummaryResponse {
  return { success: true, summary: { usage } } as unknown as SubscriptionSummaryResponse;
}

const PAGE_SUMMARY = {
  company: { id: 1, name: 'Acme Hiring' },
  currentPlan: { id: 3, code: 'growth', name: 'Growth', status: 'active', currentPeriodEnd: '2026-10-13T00:00:00.000Z' },
  usage: { recruitment: {} },
  recommendedPlan: null,
  availablePlans: [],
  invoices: [],
} as unknown as EmployerSubscriptionSummary;

describe('EmployerSubscriptionComponent -- Recruitment Storage meter (B3)', () => {
  let storageRequest: jasmine.Spy;

  function render(storage: Observable<SubscriptionSummaryResponse>,
                  page: Observable<EmployerSubscriptionSummary> = of(PAGE_SUMMARY)): ComponentFixture<EmployerSubscriptionComponent> {
    // Reduced motion, so the plan carousel never starts its timer.
    spyOn(window, 'matchMedia').and.returnValue({ matches: true } as unknown as MediaQueryList);
    storageRequest = jasmine.createSpy('guardrail.getSummary').and.returnValue(storage);
    TestBed.configureTestingModule({
      declarations: [EmployerSubscriptionComponent, SubscriptionUsageMeterComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: CompanyFacade, useValue: { companyDetails$: of(null) } },
        { provide: SubscriptionSummaryService, useValue: { getSummary: () => page } },
        { provide: SubscriptionGuardrailService, useValue: { getSummary: storageRequest } },
        { provide: SubscriptionPricingCatalogService, useValue: { getCatalog: () => throwError(new Error('catalog not under test')) } },
        { provide: Router, useValue: jasmine.createSpyObj<Router>('Router', ['navigate', 'navigateByUrl']) },
        { provide: MatDialog, useValue: {} },
        { provide: BillingService, useValue: {} },
      ],
    });
    const fixture = TestBed.createComponent(EmployerSubscriptionComponent);
    fixture.detectChanges();
    return fixture;
  }

  const meterIn = (fixture: ComponentFixture<EmployerSubscriptionComponent>) =>
    fixture.debugElement.query(By.directive(SubscriptionUsageMeterComponent));

  it('renders the meter from usage.recruitment_storage, handing the block over unchanged', () => {
    const blockSent = storageBlock('warning');
    const fixture = render(of(v4Response({ active_job_posts: SIBLING_METER, recruitment_storage: blockSent })));
    const meter = meterIn(fixture);
    expect(meter).withContext('no storage meter rendered').not.toBeNull();
    expect(meter.componentInstance.usage).toBe(blockSent);
    expect(meter.componentInstance.kind).toBe('storage');
    expect(meter.nativeElement.textContent).toContain('40 GB');
    expect(meter.nativeElement.textContent).toContain('at least 80%');
  });

  it('renders no meter when the backend sends no recruitment_storage key, as one without A2 does', () => {
    const fixture = render(of(v4Response({ active_job_posts: SIBLING_METER })));
    expect(meterIn(fixture)).toBeNull();
    expect(fixture.debugElement.query(By.css('[aria-label="Plan usage"]'))).withContext('the cockpit itself should render').not.toBeNull();
  });

  it('renders no meter when the storage request fails, and the rest of the page still loads', () => {
    const fixture = render(throwError(new Error('storage request failed')));
    expect(meterIn(fixture)).toBeNull();
    expect(fixture.componentInstance.loadError).toBeFalse();
    expect(fixture.debugElement.query(By.css('[aria-label="Plan usage"]'))).not.toBeNull();
  });

  it('at 100% tells the employer their existing applications stay safe', () => {
    const fixture = render(of(v4Response({ recruitment_storage: storageBlock('full') })));
    const shown = meterIn(fixture).nativeElement.textContent;
    expect(shown).toContain('existing applications');
    expect(shown).toContain('stay safe');
    expect(shown).not.toMatch(/delet|remov|eras|purg|lose|lost|wipe/i);
  });

  it('Retry reloads the storage block along with the summary', () => {
    const fixture = render(of(v4Response({ recruitment_storage: storageBlock('normal') })), throwError(new Error('summary unavailable')));
    expect(storageRequest).toHaveBeenCalledTimes(1);
    fixture.debugElement.query(By.css('.gh-sub-error-state button')).nativeElement.click();
    expect(storageRequest).toHaveBeenCalledTimes(2);
  });
});
