import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { CompanyFacade } from '@app-company/state/company.facade';
import { EmployeeFacade } from '@main/employee/state/employee.facade';
import { SubscriptionUpgradeRecommendationService } from '@main/employer-panel/employer-subscription/services/subscription-upgrade-recommendation.service';
import { EngagementContext } from '@main/shared/engagement/engagement-contract.models';
import { EngagementFeatureLockComponent } from '@main/shared/engagement/engagement-feature-lock.component';
import { SubscriptionEngagementService } from '@main/shared/engagement/subscription-engagement.service';
import { ENGAGEMENT_CONTEXT_RESPONSE } from '../../../testing/engagement-contract.fixture';
import { E2_CAPABILITIES_NO_PLAN_OWNER } from '../../../testing/engagement-e2-capabilities.fixture';
import { EmployerSettingsComponent } from './employer-settings.component';

/**
 * F7 on Company settings → Branding & Media (customized_company_page). With no context the tab renders as it did at
 * bef0985f; with the served lock, the tab keeps every part it had. The lock displays; it never blocks.
 */
describe('EmployerSettingsComponent -- Branding & Media with the feature lock (F7)', () => {
  let storedUser: string | null;

  beforeEach(() => {
    storedUser = localStorage.getItem('user');
    localStorage.setItem('user', JSON.stringify({ companyId: 'CO-1', companyName: 'Acme Hiring' }));
  });

  afterEach(() => {
    if (storedUser === null) { localStorage.removeItem('user'); } else { localStorage.setItem('user', storedUser); }
  });

  function brandingTab(declareLock: boolean, context: EngagementContext | null): HTMLElement {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      declarations: declareLock ? [EmployerSettingsComponent, EngagementFeatureLockComponent] : [EmployerSettingsComponent],
      providers: [
        { provide: EmployeeFacade, useValue: {} },
        { provide: CompanyFacade, useValue: { companyDetails$: of(null) } },
        { provide: MatDialog, useValue: { open: jasmine.createSpy('open') } },
        { provide: TranslateService, useValue: { instant: (key: string) => key, get: (key: string) => of(key) } },
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']) },
        { provide: ActivatedRoute, useValue: { queryParams: of({ tab: '2' }) } },
        { provide: SubscriptionEngagementService, useValue: { context$: of(context) } },
        { provide: SubscriptionUpgradeRecommendationService, useValue: { recordEvent: jasmine.createSpy('recordEvent') } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    const fixture = TestBed.createComponent(EmployerSettingsComponent);
    fixture.detectChanges();
    return fixture.nativeElement.querySelector('#ebc-panel-2');
  }

  /** The tab's text and element structure, leaving out the lock element and anything inside it. */
  function shape(panel: HTMLElement): { text: string; tags: string[] } {
    const outside = Array.from(panel.querySelectorAll('*')).filter(e => !e.closest('app-engagement-feature-lock'));
    const clone = panel.cloneNode(true) as HTMLElement;
    Array.from(clone.querySelectorAll('app-engagement-feature-lock')).forEach(e => e.remove());
    return { text: (clone.textContent || '').replace(/\s+/g, ' ').trim(), tags: outside.map(e => e.tagName) };
  }

  it('with no context (a backend without E2), Branding & Media renders exactly as it does without the lock', () => {
    const without = brandingTab(false, null);
    const beforeShape = shape(without);
    const withLock = brandingTab(true, null);
    expect(withLock.querySelector('app-engagement-feature-lock')!.textContent!.trim()).toBe('');
    expect(shape(withLock)).toEqual(beforeShape);
    expect(beforeShape.tags.length).toBeGreaterThan(10);
  });

  it('with the served lock (no plan), the lock shows its words and every part of Branding & Media is still there', () => {
    const beforeShape = shape(brandingTab(false, null));
    const context: EngagementContext = JSON.parse(JSON.stringify(ENGAGEMENT_CONTEXT_RESPONSE.context));
    context.capabilities = JSON.parse(JSON.stringify(E2_CAPABILITIES_NO_PLAN_OWNER));
    const panel = brandingTab(true, context);
    expect(panel.querySelector('.gh-feature-lock__title')!.textContent!.trim()).toBe(E2_CAPABILITIES_NO_PLAN_OWNER.features.customized_company_page!.nudge!.title);
    expect(shape(panel)).toEqual(beforeShape);
  });
});
