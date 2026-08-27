import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';

import { CompanyDashboardComponent } from './company-dashboard.component';
import { CompanyFacade } from '../state/company.facade';
import { CompanyService } from '../company.service';
import { SeoService } from '@app-core/services/seo.service';
import { SubscriptionUpgradeRecommendationService } from '../../employer-panel/employer-subscription/services/subscription-upgrade-recommendation.service';
import { UpgradePromptCooldownService } from '../../employer-panel/employer-subscription/services/upgrade-prompt-cooldown.service';

// ─── Mock factories ──────────────────────────────────────────────────────────

function makeMockCompanyFacade(overrides: Partial<{
  dashboard$: any;
  subsRestrictions$: any;
  loading$: any;
}> = {}) {
  return {
    dashboard$: overrides.dashboard$ !== undefined ? overrides.dashboard$ : of(null),
    subsRestrictions$: overrides.subsRestrictions$ !== undefined ? overrides.subsRestrictions$ : of(null),
    loading$: overrides.loading$ !== undefined ? overrides.loading$ : of(false),
    getCompanyDashboard: jasmine.createSpy('getCompanyDashboard'),
    getCompanySubscription: jasmine.createSpy('getCompanySubscription'),
  };
}

function makeMockCompanyService(pipelineResult: any = null, error = false) {
  const result = pipelineResult !== null ? pipelineResult : {
    data: { byStage: [], needsReview: [] }
  };
  return {
    getDashboardPipelineOverview: jasmine.createSpy('getDashboardPipelineOverview')
      .and.returnValue(error ? throwError(() => new Error('pipeline error')) : of(result)),
    // ngOnInit also calls loadAnalytics(), added in ce4302af. Without this the
    // component throws before any spec body runs. `data: null` is the shape
    // _mergeAnalyticsJobPerf() guards against, so it stays inert.
    getDashboardAnalytics: jasmine.createSpy('getDashboardAnalytics')
      .and.returnValue(of({ data: null })),
  };
}

/**
 * The component acquired MatDialog, SubscriptionUpgradeRecommendationService and
 * UpgradePromptCooldownService in ce4302af (Dashboard Analytics V1) without this
 * suite being updated, which is why all 67 of its specs threw NullInjectorError
 * before reaching an assertion. Defaults keep the upgrade prompt suppressed so the
 * pre-existing specs observe the same component state they were written against.
 */
function makeMockUpgradeRecommendationService(recommendation: any = null) {
  return {
    getRecommendation: jasmine.createSpy('getRecommendation')
      .and.returnValue(of(recommendation !== null ? recommendation : { showPrompt: false })),
    recordEvent: jasmine.createSpy('recordEvent'),
  };
}

function makeMockUpgradeCooldown(shouldShow = false) {
  return {
    shouldShow: jasmine.createSpy('shouldShow').and.returnValue(shouldShow),
    markShown: jasmine.createSpy('markShown'),
    dismiss: jasmine.createSpy('dismiss'),
    isNonDismissible: jasmine.createSpy('isNonDismissible').and.returnValue(false),
    isFromPricingPage: jasmine.createSpy('isFromPricingPage').and.returnValue(false),
  };
}

function makeMockDialog() {
  return {
    open: jasmine.createSpy('open').and.returnValue({
      afterClosed: () => of(undefined),
      close: () => {},
    }),
  };
}

/** Build a fully-complete Company object, override individual fields as needed. */
function makeCompany(overrides: Record<string, any> = {}) {
  return {
    companyId: 'COM001',
    companyName: 'Test Co',
    companyLogoUrl: 'https://example.com/logo.png',
    companyDetails: 'We build things.',
    companyCity: 'Sydney',
    industryId: 1,
    numberOfEmployee: 50,
    companyContactNumber: '0412345678',
    companyEmail: 'test@test.com',
    companyCountry: 'AU',
    companyAddress: '1 Test St',
    createdAt: new Date(),
    createdBy: 'uid1',
    updatedAt: new Date(),
    ...overrides,
  };
}

// ─── Test suite ───────────────────────────────────────────────────────────────

describe('CompanyDashboardComponent', () => {
  let component: CompanyDashboardComponent;
  let fixture: ComponentFixture<CompanyDashboardComponent>;
  let mockFacade: ReturnType<typeof makeMockCompanyFacade>;
  let mockService: ReturnType<typeof makeMockCompanyService>;
  let router: Router;

  function createComponent(facadeOverrides = {}, pipelineResult: any = null, pipelineError = false) {
    mockFacade = makeMockCompanyFacade(facadeOverrides);
    mockService = makeMockCompanyService(pipelineResult, pipelineError);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([])],
      declarations: [CompanyDashboardComponent],
      providers: [
        { provide: CompanyFacade, useValue: mockFacade },
        { provide: CompanyService, useValue: mockService },
        { provide: SeoService, useValue: { setPageMeta: () => {} } },
        { provide: MatDialog, useValue: makeMockDialog() },
        { provide: SubscriptionUpgradeRecommendationService, useValue: makeMockUpgradeRecommendationService() },
        { provide: UpgradePromptCooldownService, useValue: makeMockUpgradeCooldown() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(CompanyDashboardComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  }

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // §1 brandingScore() — 6-field model
  // ──────────────────────────────────────────────────────────────────────────
  describe('brandingScore()', () => {

    beforeEach(() => createComponent());

    it('returns score=100 and missing=[] when all 6 fields are present', () => {
      const result = component.brandingScore(makeCompany() as any);
      expect(result.score).toBe(100);
      expect(result.missing.length).toBe(0);
    });

    it('returns {score:0, missing:[]} for null company (null guard)', () => {
      const result = component.brandingScore(null as any);
      expect(result.score).toBe(0);
      expect(result.missing.length).toBe(0);
    });

    it('returns score=0 and 6 items when all fields are absent', () => {
      const result = component.brandingScore(makeCompany({
        companyLogoUrl: null, companyDetails: null, companyCity: null,
        industryId: null, numberOfEmployee: null, companyContactNumber: null,
      }) as any);
      expect(result.score).toBe(0);
      expect(result.missing.length).toBe(6);
      expect(result.missing).toContain('company logo');
      expect(result.missing).toContain('description');
      expect(result.missing).toContain('location');
      expect(result.missing).toContain('industry');
      expect(result.missing).toContain('team size');
      expect(result.missing).toContain('contact number');
    });

    it('returns score=50 when 3 of 6 fields are missing', () => {
      const result = component.brandingScore(makeCompany({
        companyLogoUrl: null, companyDetails: null, companyCity: null,
      }) as any);
      expect(result.score).toBe(50);
      expect(result.missing.length).toBe(3);
    });

    it('returns score=83 (5/6) when only logo is missing', () => {
      const result = component.brandingScore(makeCompany({ companyLogoUrl: null }) as any);
      expect(result.score).toBe(83);
      expect(result.missing).toContain('company logo');
    });

    it('returns score=17 (1/6) when only logo is present', () => {
      const result = component.brandingScore(makeCompany({
        companyDetails: null, companyCity: null, industryId: null,
        numberOfEmployee: null, companyContactNumber: null,
      }) as any);
      expect(result.score).toBe(17);
      expect(result.missing.length).toBe(5);
    });

    it('treats empty string companyDetails as missing', () => {
      expect(component.brandingScore(makeCompany({ companyDetails: '' }) as any).missing)
        .toContain('description');
    });

    it('treats industryId=0 as missing (0 == null is false; == null check)', () => {
      // industryId == null uses loose equality, so 0 is NOT null → not missing
      const result = component.brandingScore(makeCompany({ industryId: 0 }) as any);
      // 0 == null → false in JS, so industryId:0 should NOT appear in missing
      expect(result.missing).not.toContain('industry');
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // §2 companyProfileMissingFields() — now checks 6 fields (was 3)
  // ──────────────────────────────────────────────────────────────────────────
  describe('companyProfileMissingFields()', () => {

    beforeEach(() => createComponent());

    it('returns [] when company is null', () => {
      expect(component.companyProfileMissingFields(null as any)).toEqual([]);
    });

    it('returns [] when all 6 fields are present', () => {
      expect(component.companyProfileMissingFields(makeCompany() as any)).toEqual([]);
    });

    it('reports "logo" for missing companyLogoUrl', () => {
      expect(component.companyProfileMissingFields(makeCompany({ companyLogoUrl: null }) as any))
        .toContain('logo');
    });

    it('reports "company description" for missing companyDetails', () => {
      expect(component.companyProfileMissingFields(makeCompany({ companyDetails: '' }) as any))
        .toContain('company description');
    });

    it('reports "location" for missing companyCity', () => {
      expect(component.companyProfileMissingFields(makeCompany({ companyCity: null }) as any))
        .toContain('location');
    });

    it('reports "industry" for missing industryId (null)', () => {
      expect(component.companyProfileMissingFields(makeCompany({ industryId: null }) as any))
        .toContain('industry');
    });

    it('reports "team size" for missing numberOfEmployee', () => {
      expect(component.companyProfileMissingFields(makeCompany({ numberOfEmployee: null }) as any))
        .toContain('team size');
    });

    it('reports "contact number" for missing companyContactNumber', () => {
      expect(component.companyProfileMissingFields(makeCompany({ companyContactNumber: null }) as any))
        .toContain('contact number');
    });

    it('reports all 6 missing when all fields are absent', () => {
      const result = component.companyProfileMissingFields(makeCompany({
        companyLogoUrl: null, companyDetails: null, companyCity: null,
        industryId: null, numberOfEmployee: null, companyContactNumber: null,
      }) as any);
      expect(result.length).toBe(6);
    });

    it('returns only the 3 missing entries when logo/description/city absent (other 3 present)', () => {
      const result = component.companyProfileMissingFields(makeCompany({
        companyLogoUrl: null, companyDetails: null, companyCity: null,
      }) as any);
      expect(result.length).toBe(3);
      expect(result).toContain('logo');
      expect(result).toContain('company description');
      expect(result).toContain('location');
      expect(result).not.toContain('industry');
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // §3 subscriptionDaysLeft()
  // ──────────────────────────────────────────────────────────────────────────
  describe('subscriptionDaysLeft()', () => {

    beforeEach(() => createComponent());

    it('returns 0 for null', () => {
      expect(component.subscriptionDaysLeft(null)).toBe(0);
    });

    it('returns 0 for undefined', () => {
      expect(component.subscriptionDaysLeft(undefined)).toBe(0);
    });

    it('returns 0 for empty string', () => {
      expect(component.subscriptionDaysLeft('')).toBe(0);
    });

    it('returns 0 for invalid date string', () => {
      expect(component.subscriptionDaysLeft('not-a-date')).toBe(0);
    });

    it('returns 0 (not negative) for a past date', () => {
      const past = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      expect(component.subscriptionDaysLeft(past)).toBe(0);
    });

    it('returns positive number for a future date', () => {
      const future = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const result = component.subscriptionDaysLeft(future);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThanOrEqual(31);
    });

    it('uses Math.ceil — 1ms in the future is 1 day', () => {
      const almostNow = new Date(Date.now() + 1000).toISOString();
      expect(component.subscriptionDaysLeft(almostNow)).toBe(1);
    });

    it('accepts a Date object directly', () => {
      const future = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
      expect(component.subscriptionDaysLeft(future)).toBeGreaterThan(0);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // §4 subscriptionUsagePct()
  // ──────────────────────────────────────────────────────────────────────────
  describe('subscriptionUsagePct()', () => {

    beforeEach(() => createComponent());

    it('returns 0 when limit is 0', () => {
      expect(component.subscriptionUsagePct(5, 0)).toBe(0);
    });

    it('returns 0 when limit is null', () => {
      expect(component.subscriptionUsagePct(5, null as any)).toBe(0);
    });

    it('returns 0 when used is 0', () => {
      expect(component.subscriptionUsagePct(0, 10)).toBe(0);
    });

    it('returns 50 for half usage', () => {
      expect(component.subscriptionUsagePct(5, 10)).toBe(50);
    });

    it('returns 100 at limit', () => {
      expect(component.subscriptionUsagePct(10, 10)).toBe(100);
    });

    it('caps at 100 when over limit', () => {
      expect(component.subscriptionUsagePct(15, 10)).toBe(100);
    });

    it('rounds correctly (1/3 → 33)', () => {
      expect(component.subscriptionUsagePct(1, 3)).toBe(33);
    });

    it('rounds correctly (2/3 → 67)', () => {
      expect(component.subscriptionUsagePct(2, 3)).toBe(67);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // §5 _buildRecommendedStep() — 6 priority branches (via cachedRecommendedStep)
  // ──────────────────────────────────────────────────────────────────────────
  describe('_buildRecommendedStep() priority branches', () => {

    beforeEach(() => createComponent());

    function callBuild(charts: any) {
      (component as any)._buildRecommendedStep(charts);
    }

    it('branch 1: missingCount>=2 → complete_company_profile (high)', () => {
      component.cachedProfileMissingFields = ['logo', 'industry'];
      callBuild({ activeJobs: 0, interviews: 0 });
      expect(component.cachedRecommendedStep!.type).toBe('complete_company_profile');
      expect(component.cachedRecommendedStep!.priority).toBe('high');
    });

    it('branch 2: missingCount<2 and activeJobs=0 → post_first_job (high)', () => {
      component.cachedProfileMissingFields = [];
      callBuild({ activeJobs: 0, interviews: 0 });
      expect(component.cachedRecommendedStep!.type).toBe('post_first_job');
      expect(component.cachedRecommendedStep!.priority).toBe('high');
    });

    it('branch 3: needsReviewCount>0 → review_applicants (high)', () => {
      component.cachedProfileMissingFields = [];
      component.needsReviewCount = 5;
      callBuild({ activeJobs: 3, interviews: 0 });
      expect(component.cachedRecommendedStep!.type).toBe('review_applicants');
      expect(component.cachedRecommendedStep!.priority).toBe('high');
      expect(component.cachedRecommendedStep!.count).toBe(5);
    });

    it('branch 4: interviews>0 and no review needed → review_video_answers (medium)', () => {
      component.cachedProfileMissingFields = [];
      component.needsReviewCount = 0;
      callBuild({ activeJobs: 3, interviews: 4 });
      expect(component.cachedRecommendedStep!.type).toBe('review_video_answers');
      expect(component.cachedRecommendedStep!.priority).toBe('medium');
    });

    it('branch 5: score<80 and no urgent tasks → improve_employer_brand (low)', () => {
      component.cachedProfileMissingFields = ['logo']; // length=1 < 2, so not branch 1
      component.needsReviewCount = 0;
      component.cachedBrandingScore = { score: 60, missing: ['logo'] };
      callBuild({ activeJobs: 2, interviews: 0 });
      expect(component.cachedRecommendedStep!.type).toBe('improve_employer_brand');
      expect(component.cachedRecommendedStep!.priority).toBe('low');
    });

    it('branch 6: all good → all_caught_up (success)', () => {
      component.cachedProfileMissingFields = [];
      component.needsReviewCount = 0;
      component.cachedBrandingScore = { score: 100, missing: [] };
      callBuild({ activeJobs: 2, interviews: 0 });
      expect(component.cachedRecommendedStep!.type).toBe('all_caught_up');
      expect(component.cachedRecommendedStep!.priority).toBe('success');
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // §6 _computeJobViewsCache()
  // ──────────────────────────────────────────────────────────────────────────
  describe('_computeJobViewsCache()', () => {

    beforeEach(() => createComponent());

    function callCompute(graph: any) {
      (component as any)._computeJobViewsCache(graph);
    }

    it('sets 0 and null conversion when graph is null', () => {
      callCompute(null);
      expect(component.cachedJobViewsThisMonth).toBe(0);
      expect(component.cachedConversionRate).toBeNull();
    });

    it('sets 0 when jobViews is not an array', () => {
      callCompute({ jobViews: null });
      expect(component.cachedJobViewsThisMonth).toBe(0);
    });

    it('counts only current-month rows', () => {
      const now = new Date();
      const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-15`;
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 15).toISOString();
      (component as any)._lastDashboardCharts = { applicants: 10 };
      callCompute({ jobViews: [
        { date: thisMonth, count: 200 },
        { date: lastMonth, count: 50 },
      ]});
      expect(component.cachedJobViewsThisMonth).toBe(200);
    });

    it('returns null conversion rate when no job views this month', () => {
      const lastMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 15).toISOString();
      callCompute({ jobViews: [{ date: lastMonth, count: 100 }] });
      expect(component.cachedJobViewsThisMonth).toBe(0);
      expect(component.cachedConversionRate).toBeNull();
    });

    it('computes conversion rate when views > 0', () => {
      const now = new Date();
      const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
      (component as any)._lastDashboardCharts = { applicants: 20 };
      callCompute({ jobViews: [{ date: thisMonth, count: 100 }] });
      expect(component.cachedConversionRate).toBe('20.0%');
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // §7 _computeCitiesCache()
  // ──────────────────────────────────────────────────────────────────────────
  describe('_computeCitiesCache()', () => {

    beforeEach(() => createComponent());

    function callCompute(stat: any) {
      (component as any)._computeCitiesCache(stat);
    }

    it('returns [] for null stat', () => {
      callCompute(null);
      expect(component.cachedCities).toEqual([]);
    });

    it('returns [] when stat has no cities', () => {
      callCompute({});
      expect(component.cachedCities).toEqual([]);
    });

    it('handles flat array cities', () => {
      const cities = [{ city: 'Manila', count: '10' }];
      callCompute({ cities });
      expect(component.cachedCities).toEqual(cities);
    });

    it('handles nested {cities:[]} object', () => {
      const cities = [{ city: 'Cebu', count: '5' }];
      callCompute({ cities: { cities } });
      expect(component.cachedCities).toEqual(cities);
    });

    it('returns [] for unrecognized cities shape', () => {
      callCompute({ cities: { weird: true } });
      expect(component.cachedCities).toEqual([]);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // §8 _buildJobGroups()
  // ──────────────────────────────────────────────────────────────────────────
  describe('_buildJobGroups()', () => {

    beforeEach(() => createComponent());

    function buildJobGroups(items: any[]) {
      return (component as any)._buildJobGroups(items);
    }

    it('returns [] for empty array', () => {
      expect(buildJobGroups([])).toEqual([]);
    });

    it('returns [] for null', () => {
      expect(buildJobGroups(null as any)).toEqual([]);
    });

    it('returns single group with count=1 for one item', () => {
      const items = [
        { applicationId: 'A1', jobId: 'J1', jobTitle: 'Dev', candidateName: 'X', statusId: 1, submittedDate: '' }
      ];
      const result = buildJobGroups(items);
      expect(result.length).toBe(1);
      expect(result[0].count).toBe(1);
      expect(result[0].jobTitle).toBe('Dev');
    });

    it('groups 2 applicants under same jobId with count=2', () => {
      const items = [
        { applicationId: 'A1', jobId: 'J1', jobTitle: 'Dev', candidateName: 'X', statusId: 1, submittedDate: '' },
        { applicationId: 'A2', jobId: 'J1', jobTitle: 'Dev', candidateName: 'Y', statusId: 1, submittedDate: '' },
      ];
      expect(buildJobGroups(items)[0].count).toBe(2);
    });

    it('separates items with different jobIds', () => {
      const items = [
        { applicationId: 'A1', jobId: 'J1', jobTitle: 'Dev', candidateName: 'X', statusId: 1, submittedDate: '' },
        { applicationId: 'A2', jobId: 'J2', jobTitle: 'PM', candidateName: 'Y', statusId: 1, submittedDate: '' },
      ];
      expect(buildJobGroups(items).length).toBe(2);
    });

    it('sorts groups by count descending', () => {
      const items = [
        { applicationId: 'A1', jobId: 'J1', jobTitle: 'Low', candidateName: 'X', statusId: 1, submittedDate: '' },
        { applicationId: 'A2', jobId: 'J2', jobTitle: 'High', candidateName: 'Y', statusId: 1, submittedDate: '' },
        { applicationId: 'A3', jobId: 'J2', jobTitle: 'High', candidateName: 'Z', statusId: 1, submittedDate: '' },
      ];
      const result = buildJobGroups(items);
      expect(result[0].jobId).toBe('J2'); // count=2 first
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // §9 needsReviewCount derivation from pipeline data
  // ──────────────────────────────────────────────────────────────────────────
  describe('needsReviewCount derivation', () => {

    it('is 0 by default before pipeline data loads', () => {
      createComponent();
      fixture.detectChanges();
      expect(component.needsReviewCount).toBe(0);
    });

    it('sums status 1 and status 3 correctly', () => {
      const pipeline = { data: { byStage: [
        { statusId: 1, label: 'Pending Review', count: 4 },
        { statusId: 2, label: 'Screening', count: 10 },
        { statusId: 3, label: 'Under Review', count: 2 },
      ], needsReview: [] } };
      createComponent({}, pipeline);
      fixture.detectChanges();
      expect(component.needsReviewCount).toBe(6);
    });

    it('does NOT include status 2, 4, or other statuses', () => {
      const pipeline = { data: { byStage: [
        { statusId: 2, label: 'Screening', count: 100 },
        { statusId: 4, label: 'Offer', count: 50 },
      ], needsReview: [] } };
      createComponent({}, pipeline);
      fixture.detectChanges();
      expect(component.needsReviewCount).toBe(0);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // §10 Navigation methods
  // ──────────────────────────────────────────────────────────────────────────
  describe('Navigation methods', () => {

    beforeEach(() => {
      createComponent();
      fixture.detectChanges();
    });

    it('goToCreateJob opens the AI Create assistant instead of navigating', () => {
      // Behaviour change: goToCreateJob() used to route to /recruiter/jobs/create.
      // It now opens EasyJobPostAssistantModalComponent in a dialog and never
      // navigates. The old assertion was masked by the ngOnInit crash above.
      const navSpy = spyOn(router, 'navigate');
      const dialog = TestBed.inject(MatDialog);

      component.goToCreateJob();

      expect(dialog.open).toHaveBeenCalled();
      expect(navSpy).not.toHaveBeenCalled();
    });

    it('goToJobsList navigates to /recruiter/jobs/list', () => {
      const spy = spyOn(router, 'navigate');
      component.goToJobsList();
      expect(spy).toHaveBeenCalledWith(['/recruiter/jobs/list']);
    });

    it('goToCompanyProfile navigates to /recruiter/company/settings', () => {
      const spy = spyOn(router, 'navigate');
      component.goToCompanyProfile();
      expect(spy).toHaveBeenCalledWith(['/recruiter/company/settings']);
    });

    it('goToApplicants with jobId adds queryParams', () => {
      const spy = spyOn(router, 'navigate');
      component.goToApplicants('JOB123');
      expect(spy).toHaveBeenCalledWith(['/recruiter/jobs/applicants'], { queryParams: { id: 'JOB123' } });
    });

    it('goToApplicants without jobId navigates to /recruiter/jobs/list', () => {
      const spy = spyOn(router, 'navigate');
      component.goToApplicants();
      expect(spy).toHaveBeenCalledWith(['/recruiter/jobs/list']);
    });

    it('goToMessages navigates to /recruiter/messages', () => {
      const spy = spyOn(router, 'navigate');
      component.goToMessages();
      expect(spy).toHaveBeenCalledWith(['/recruiter/messages']);
    });

    it('goToSubscription navigates to /recruiter/subscription', () => {
      const spy = spyOn(router, 'navigate');
      component.goToSubscription();
      expect(spy).toHaveBeenCalledWith(['/recruiter/subscription']);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // §11 retryPipelineOverview()
  // ──────────────────────────────────────────────────────────────────────────
  describe('retryPipelineOverview()', () => {

    it('re-calls getDashboardPipelineOverview when retried', () => {
      createComponent({}, null, true); // initial call errors
      fixture.detectChanges();
      expect(component.pipelineError).toBe(true);

      mockService.getDashboardPipelineOverview.and.returnValue(
        of({ data: { byStage: [], needsReview: [] } })
      );

      component.retryPipelineOverview();
      expect(mockService.getDashboardPipelineOverview).toHaveBeenCalledTimes(2);
      expect(component.pipelineError).toBe(false);
      expect(component.pipelineLoading).toBe(false);
    });
  });
});
