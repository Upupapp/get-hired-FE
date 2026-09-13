import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { SeoService } from '@app-core/services/seo.service';
import { SubscriptionUsageMeterComponent } from '@main/employer-panel/employer-subscription/components/subscription-usage-meter/subscription-usage-meter.component';
import { TrialDaysRemainingBadgeComponent } from '@main/employer-panel/employer-subscription/components/trial-days-remaining-badge/trial-days-remaining-badge.component';
import { SubscriptionUpgradeRecommendationService } from '@main/employer-panel/employer-subscription/services/subscription-upgrade-recommendation.service';
import { UpgradePromptCooldownService } from '@main/employer-panel/employer-subscription/services/upgrade-prompt-cooldown.service';
import { EngagementSubscription } from '@main/shared/engagement/engagement-contract.models';
import { SubscriptionEngagementService } from '@main/shared/engagement/subscription-engagement.service';
import { TrialStatusWidgetComponent } from '@main/shared/engagement/trial-status-widget.component';
import { ENGAGEMENT_CONTEXT_RESPONSE } from '../../../testing/engagement-contract.fixture';
import { E2_SUB_TRIAL_ENDING, E2_SUB_TRIAL_EXPIRED, E2_USAGE_CONFIRMED } from '../../../testing/engagement-e2-trial.fixture';
import { CompanyService } from '../company.service';
import { CompanyFacade } from '../state/company.facade';
import { CompanyDashboardComponent } from './company-dashboard.component';

/**
 * F4, RUL-13: the trial widget is added beside the dashboard's V4 upgrade nudge and replaces nothing. The nudge's
 * B6.1/B6.2 trial copy (company-dashboard.component.ts :230 and :231) still renders, word for word.
 */
describe('CompanyDashboardComponent -- the trial widget sits beside the trial nudge, which still renders (F4, RUL-13)', () => {
  function render(copyKey: 'trial_expired' | 'trial_ending', subscription: EngagementSubscription): HTMLElement {
    TestBed.configureTestingModule({
      declarations: [CompanyDashboardComponent, TrialStatusWidgetComponent, TrialDaysRemainingBadgeComponent, SubscriptionUsageMeterComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {
          provide: CompanyFacade,
          useValue: {
            dashboard$: of({ company: { companyName: 'Acme Hiring' }, charts: { activeJobs: 1, applicants: 0, interviews: 0 }, stat: { totalContacts: 0 }, graph: null, jobViews: null }),
            subsRestrictions$: of(null),
            loading$: of(false),
            getCompanyDashboard: jasmine.createSpy('getCompanyDashboard'),
            getCompanySubscription: jasmine.createSpy('getCompanySubscription'),
          },
        },
        {
          provide: CompanyService,
          useValue: {
            getDashboardPipelineOverview: () => of({ data: { byStage: [], needsReview: [] } }),
            getDashboardAnalytics: () => of({ data: null }),
          },
        },
        { provide: SeoService, useValue: { setPageMeta: jasmine.createSpy('setPageMeta') } },
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']) },
        { provide: MatDialog, useValue: { open: () => ({ afterClosed: () => of(undefined) }) } },
        {
          provide: SubscriptionUpgradeRecommendationService,
          useValue: {
            getRecommendation: () => of({ recommendation: { showPrompt: true, priority: 1, trigger: copyKey, copyKey, primaryCta: 'Choose a plan' } }),
            recordEvent: jasmine.createSpy('recordEvent'),
          },
        },
        {
          provide: UpgradePromptCooldownService,
          useValue: { shouldShow: () => true, markShown: () => {}, dismiss: () => {}, isNonDismissible: () => false, isFromPricingPage: () => false },
        },
        { provide: SubscriptionEngagementService, useValue: { context$: of({ ...ENGAGEMENT_CONTEXT_RESPONSE.context, subscription, usage: E2_USAGE_CONFIRMED }) } },
      ],
    });
    const fixture = TestBed.createComponent(CompanyDashboardComponent);
    fixture.detectChanges();
    return fixture.nativeElement;
  }

  const text = (root: HTMLElement, selector: string): string => ((root.querySelector(selector) || { textContent: '' }).textContent || '').replace(/\s+/g, ' ').trim();

  it('trial_expired: the nudge still shows its :230 copy, and the widget says the trial has ended', () => {
    const root = render('trial_expired', E2_SUB_TRIAL_EXPIRED);
    expect(text(root, '.gh-upgrade-nudge__title')).toBe('Your free trial has ended');
    expect(text(root, '.gh-upgrade-nudge__sub')).toBe('Your published jobs stay published. Choose a plan to publish or reopen jobs, add team members, or add screening questions.');
    expect(text(root, 'app-trial-status-widget .trial-badge')).toBe('Your free trial has ended');
  });

  it('trial_ending: the nudge still shows its :231 copy, and the widget shows the days left', () => {
    const root = render('trial_ending', E2_SUB_TRIAL_ENDING);
    expect(text(root, '.gh-upgrade-nudge__title')).toBe('Your free trial is ending soon');
    expect(text(root, '.gh-upgrade-nudge__sub')).toBe('Choose a plan to publish or reopen jobs, add team members, or add screening questions.');
    expect(text(root, 'app-trial-status-widget .trial-badge')).toBe('1 day left in your free trial');
  });
});
