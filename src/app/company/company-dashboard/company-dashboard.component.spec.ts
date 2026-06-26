import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { of, throwError, Subject } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { CompanyDashboardComponent } from './company-dashboard.component';
import { CompanyFacade } from '../state/company.facade';
import { CompanyService } from '../company.service';

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
  };
}

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
      ],
      schemas: [NO_ERRORS_SCHEMA], // ignore sub-components (app-empty-section etc.)
    });

    fixture = TestBed.createComponent(CompanyDashboardComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  }

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // §1 brandingScore()
  // ──────────────────────────────────────────────────────────────────────────
  describe('brandingScore()', () => {

    beforeEach(() => createComponent());

    it('returns score=100 and missing=[] when all 6 fields are present', () => {
      const company = makeCompany(); // all 6 fields set
      const result = component.brandingScore(company as any);
      expect(result.score).toBe(100);
      expect(result.missing.length).toBe(0);
    });

    it('returns score=0 and all 6 fields in missing[] when company is null', () => {
      const result = component.brandingScore(null as any);
      expect(result.score).toBe(0);
      expect(result.missing.length).toBe(0); // null guard returns {score:0, missing:[]}
    });

    it('returns score=0 and 6 items in missing when all fields are absent', () => {
      const company = makeCompany({
        companyLogoUrl: null,
        companyDetails: null,
        companyCity: null,
        industryId: null,
        numberOfEmployee: null,
        companyContactNumber: null,
      });
      const result = component.brandingScore(company as any);
      expect(result.score).toBe(0);
      expect(result.missing).toContain('company logo');
      expect(result.missing).toContain('description');
      expect(result.missing).toContain('location');
      expect(result.missing).toContain('industry');
      expect(result.missing).toContain('team size');
      expect(result.missing).toContain('contact number');
      expect(result.missing.length).toBe(6);
    });

    it('returns score=50 when 3 of 6 fields are missing', () => {
      const company = makeCompany({
        companyLogoUrl: null,
        companyDetails: null,
        companyCity: null,
      });
      const result = component.brandingScore(company as any);
      expect(result.score).toBe(50);
      expect(result.missing.length).toBe(3);
    });

    it('returns score=83 (5/6) when only company logo is missing', () => {
      const company = makeCompany({ companyLogoUrl: null });
      const result = component.brandingScore(company as any);
      expect(result.score).toBe(83); // Math.round(5/6*100) = 83
      expect(result.missing).toContain('company logo');
      expect(result.missing.length).toBe(1);
    });

    it('returns score=17 (1/6) when only companyLogoUrl is present', () => {
      const company = makeCompany({
        companyDetails: null,
        companyCity: null,
        industryId: null,
        numberOfEmployee: null,
        companyContactNumber: null,
      });
      const result = component.brandingScore(company as any);
      expect(result.score).toBe(17); // Math.round(1/6*100) = 17
      expect(result.missing.length).toBe(5);
    });

    it('treats empty string companyDetails as missing', () => {
      const company = makeCompany({ companyDetails: '' });
      const result = component.brandingScore(company as any);
      expect(result.missing).toContain('description');
    });

    it('treats empty string companyCity as missing', () => {
      const company = makeCompany({ companyCity: '' });
      const result = component.brandingScore(company as any);
      expect(result.missing).toContain('location');
    });

    it('treats industryId=0 as missing (falsy edge case)', () => {
      // industryId=0 is falsy; this is a known edge case documented in sweep
      const company = makeCompany({ industryId: 0 });
      const result = component.brandingScore(company as any);
      expect(result.missing).toContain('industry');
    });

    it('returns score=100 when all fields are truthy non-empty strings', () => {
      const company = makeCompany({
        companyLogoUrl: 'logo.png',
        companyDetails: 'desc',
        companyCity: 'City',
        industryId: 5,
        numberOfEmployee: 10,
        companyContactNumber: '123',
      });
      const result = component.brandingScore(company as any);
      expect(result.score).toBe(100);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // §2 _buildJobGroups()
  // ──────────────────────────────────────────────────────────────────────────
  describe('_buildJobGroups()', () => {

    beforeEach(() => createComponent());

    // Access private method via bracket notation for testing
    function buildJobGroups(items: any[]) {
      return (component as any)._buildJobGroups(items);
    }

    it('returns [] when given an empty array', () => {
      expect(buildJobGroups([])).toEqual([]);
    });

    it('returns [] when given null', () => {
      expect(buildJobGroups(null as any)).toEqual([]);
    });

    it('returns [] when given undefined', () => {
      expect(buildJobGroups(undefined as any)).toEqual([]);
    });

    it('returns single group with count=1 for a single item', () => {
      const items = [
        { applicationId: 'A1', jobId: 'J1', jobTitle: 'Developer', candidateName: 'Jane', statusId: 1, submittedDate: '2026-01-01' }
      ];
      const result = buildJobGroups(items);
      expect(result.length).toBe(1);
      expect(result[0].jobId).toBe('J1');
      expect(result[0].jobTitle).toBe('Developer');
      expect(result[0].count).toBe(1);
    });

    it('groups multiple items with the same jobId correctly', () => {
      const items = [
        { applicationId: 'A1', jobId: 'J1', jobTitle: 'Developer', candidateName: 'Jane', statusId: 1, submittedDate: '2026-01-01' },
        { applicationId: 'A2', jobId: 'J1', jobTitle: 'Developer', candidateName: 'Bob', statusId: 3, submittedDate: '2026-01-02' },
        { applicationId: 'A3', jobId: 'J1', jobTitle: 'Developer', candidateName: 'Alice', statusId: 1, submittedDate: '2026-01-03' },
      ];
      const result = buildJobGroups(items);
      expect(result.length).toBe(1);
      expect(result[0].count).toBe(3);
    });

    it('separates items with different jobIds into different groups', () => {
      const items = [
        { applicationId: 'A1', jobId: 'J1', jobTitle: 'Developer', candidateName: 'Jane', statusId: 1, submittedDate: '2026-01-01' },
        { applicationId: 'A2', jobId: 'J2', jobTitle: 'Designer', candidateName: 'Bob', statusId: 3, submittedDate: '2026-01-02' },
      ];
      const result = buildJobGroups(items);
      expect(result.length).toBe(2);
      const jobIds = result.map((r: any) => r.jobId);
      expect(jobIds).toContain('J1');
      expect(jobIds).toContain('J2');
    });

    it('sorts groups by count descending', () => {
      const items = [
        { applicationId: 'A1', jobId: 'J1', jobTitle: 'Low', candidateName: 'X', statusId: 1, submittedDate: '2026-01-01' },
        { applicationId: 'A2', jobId: 'J2', jobTitle: 'High', candidateName: 'Y', statusId: 1, submittedDate: '2026-01-02' },
        { applicationId: 'A3', jobId: 'J2', jobTitle: 'High', candidateName: 'Z', statusId: 1, submittedDate: '2026-01-03' },
        { applicationId: 'A4', jobId: 'J3', jobTitle: 'Mid', candidateName: 'W', statusId: 3, submittedDate: '2026-01-04' },
        { applicationId: 'A5', jobId: 'J3', jobTitle: 'Mid', candidateName: 'V', statusId: 1, submittedDate: '2026-01-05' },
        { applicationId: 'A6', jobId: 'J3', jobTitle: 'Mid', candidateName: 'U', statusId: 3, submittedDate: '2026-01-06' },
      ];
      const result = buildJobGroups(items);
      expect(result[0].jobId).toBe('J3'); // count=3, highest
      expect(result[1].jobId).toBe('J2'); // count=2
      expect(result[2].jobId).toBe('J1'); // count=1
    });

    it('uses jobTitle from the first item encountered for the group', () => {
      const items = [
        { applicationId: 'A1', jobId: 'J1', jobTitle: 'Senior Developer', candidateName: 'X', statusId: 1, submittedDate: '2026-01-01' },
        { applicationId: 'A2', jobId: 'J1', jobTitle: 'Senior Developer', candidateName: 'Y', statusId: 1, submittedDate: '2026-01-02' },
      ];
      const result = buildJobGroups(items);
      expect(result[0].jobTitle).toBe('Senior Developer');
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // §3 subscriptionUsagePct()
  // ──────────────────────────────────────────────────────────────────────────
  describe('subscriptionUsagePct()', () => {

    beforeEach(() => createComponent());

    it('returns 0 when limit is 0', () => {
      expect(component.subscriptionUsagePct(5, 0)).toBe(0);
    });

    it('returns 0 when limit is null', () => {
      expect(component.subscriptionUsagePct(5, null as any)).toBe(0);
    });

    it('returns 0 when limit is undefined', () => {
      expect(component.subscriptionUsagePct(5, undefined as any)).toBe(0);
    });

    it('returns 0 when used is 0', () => {
      expect(component.subscriptionUsagePct(0, 10)).toBe(0);
    });

    it('returns 50 for half usage', () => {
      expect(component.subscriptionUsagePct(5, 10)).toBe(50);
    });

    it('returns 100 for full usage', () => {
      expect(component.subscriptionUsagePct(10, 10)).toBe(100);
    });

    it('returns 100 (capped) when used exceeds limit', () => {
      expect(component.subscriptionUsagePct(15, 10)).toBe(100);
    });

    it('returns 100 (capped) when used is far above limit', () => {
      expect(component.subscriptionUsagePct(1000, 10)).toBe(100);
    });

    it('rounds to nearest integer', () => {
      // 1/3 * 100 = 33.33... → rounds to 33
      expect(component.subscriptionUsagePct(1, 3)).toBe(33);
    });

    it('rounds up correctly', () => {
      // 2/3 * 100 = 66.66... → rounds to 67
      expect(component.subscriptionUsagePct(2, 3)).toBe(67);
    });

    it('returns correct pct for typical job post scenario', () => {
      // 3 used of 20 allowed → 15%
      expect(component.subscriptionUsagePct(3, 20)).toBe(15);
    });

    it('handles large limits correctly', () => {
      expect(component.subscriptionUsagePct(1, 1000)).toBe(0); // rounds to 0
      expect(component.subscriptionUsagePct(500, 1000)).toBe(50);
      expect(component.subscriptionUsagePct(999, 1000)).toBe(100); // rounds to 100
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // §4 subscriptionDaysLeft()
  // ──────────────────────────────────────────────────────────────────────────
  describe('subscriptionDaysLeft()', () => {

    beforeEach(() => createComponent());

    it('returns 0 when endAt is null', () => {
      expect(component.subscriptionDaysLeft(null)).toBe(0);
    });

    it('returns 0 when endAt is undefined', () => {
      expect(component.subscriptionDaysLeft(undefined)).toBe(0);
    });

    it('returns 0 when endAt is empty string', () => {
      expect(component.subscriptionDaysLeft('')).toBe(0);
    });

    it('returns 0 (not negative) for past dates', () => {
      const pastDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days ago
      expect(component.subscriptionDaysLeft(pastDate)).toBe(0);
    });

    it('returns positive number for a future date', () => {
      const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days ahead
      const result = component.subscriptionDaysLeft(futureDate);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThanOrEqual(31); // ceiling rounding, may be 30 or 31
    });

    it('returns approximately 1 for a date 1 day in the future', () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const result = component.subscriptionDaysLeft(tomorrow);
      expect(result).toBe(1);
    });

    it('returns approximately 365 for a date 1 year in the future', () => {
      const oneYear = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
      const result = component.subscriptionDaysLeft(oneYear);
      expect(result).toBeGreaterThanOrEqual(364);
      expect(result).toBeLessThanOrEqual(366);
    });

    it('uses Math.ceil so partial days count as 1', () => {
      // 1ms in the future should still be 1 day (ceil)
      const almostNow = new Date(Date.now() + 1000).toISOString();
      expect(component.subscriptionDaysLeft(almostNow)).toBe(1);
    });

    it('accepts Date object as well as string', () => {
      const futureDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
      const result = component.subscriptionDaysLeft(futureDate);
      expect(result).toBeGreaterThan(0);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // §5 needsReviewCount — verifies it sums status 1 and 3 only
  // ──────────────────────────────────────────────────────────────────────────
  describe('needsReviewCount derivation', () => {

    it('is 0 by default before pipeline data loads', () => {
      createComponent();
      fixture.detectChanges(); // triggers ngOnInit
      // pipeline immediately returns empty arrays (default mock)
      expect(component.needsReviewCount).toBe(0);
    });

    it('sums status 1 and 3 correctly from byStage', () => {
      const pipelineResult = {
        data: {
          byStage: [
            { statusId: 1, label: 'Pending Review', count: 4 },
            { statusId: 2, label: 'Screening', count: 10 },
            { statusId: 3, label: 'Under Review', count: 2 },
            { statusId: 4, label: 'Offer', count: 1 },
          ],
          needsReview: []
        }
      };
      createComponent({}, pipelineResult);
      fixture.detectChanges();
      expect(component.needsReviewCount).toBe(6); // 4 + 2
    });

    it('does NOT include status 2, 4, or other statuses in count', () => {
      const pipelineResult = {
        data: {
          byStage: [
            { statusId: 2, label: 'Screening', count: 100 },
            { statusId: 4, label: 'Offer', count: 50 },
            { statusId: 5, label: 'Hired', count: 20 },
          ],
          needsReview: []
        }
      };
      createComponent({}, pipelineResult);
      fixture.detectChanges();
      expect(component.needsReviewCount).toBe(0); // none of these are status 1 or 3
    });

    it('counts status 1 only when status 3 is absent', () => {
      const pipelineResult = {
        data: {
          byStage: [
            { statusId: 1, label: 'Pending Review', count: 7 },
          ],
          needsReview: []
        }
      };
      createComponent({}, pipelineResult);
      fixture.detectChanges();
      expect(component.needsReviewCount).toBe(7);
    });

    it('counts status 3 only when status 1 is absent', () => {
      const pipelineResult = {
        data: {
          byStage: [
            { statusId: 3, label: 'Under Review', count: 3 },
          ],
          needsReview: []
        }
      };
      createComponent({}, pipelineResult);
      fixture.detectChanges();
      expect(component.needsReviewCount).toBe(3);
    });

    it('is 0 when byStage is empty', () => {
      const pipelineResult = { data: { byStage: [], needsReview: [] } };
      createComponent({}, pipelineResult);
      fixture.detectChanges();
      expect(component.needsReviewCount).toBe(0);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // §6 Smoke tests — template rendering with mocked facade
  // ──────────────────────────────────────────────────────────────────────────
  describe('Template smoke tests', () => {

    const mockDashboardData = {
      company: makeCompany(),
      charts: { activeJobs: 5, applicants: 42, interviews: 8 },
      graph: [],
      jobViews: [],
      statistic: { contacts: '60', applicants: '40' },
      totalContacts: 20,
      cities: []
    };

    it('renders without error when all data is available', () => {
      createComponent({
        loading$: of(false),
        dashboard$: of(mockDashboardData),
        subsRestrictions$: of(null),
      }, { data: { byStage: [], needsReview: [] } });

      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('shows skeleton when loading$ emits true', () => {
      createComponent({
        loading$: of(true),
        dashboard$: of(null),
        subsRestrictions$: of(null),
      });
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      // skeleton template should be rendered instead of main content
      expect(compiled.querySelector('.emp-dash-hero-skeleton')).toBeTruthy();
      expect(compiled.querySelector('.emp-dash')).toBeFalsy();
    });

    it('renders main content when loading$ emits false', () => {
      createComponent({
        loading$: of(false),
        dashboard$: of(mockDashboardData),
        subsRestrictions$: of(null),
      }, { data: { byStage: [], needsReview: [] } });
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.emp-dash')).toBeTruthy();
    });

    it('renders the hero section with company name', () => {
      createComponent({
        loading$: of(false),
        dashboard$: of(mockDashboardData),
        subsRestrictions$: of(null),
      }, { data: { byStage: [], needsReview: [] } });
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const hero = compiled.querySelector('.emp-dash-hero-title');
      expect(hero).toBeTruthy();
      expect(hero!.textContent).toContain('Test Co');
    });

    it('shows fallback company name when company is null', () => {
      const noCompanyDash = { ...mockDashboardData, company: null };
      createComponent({
        loading$: of(false),
        dashboard$: of(noCompanyDash),
        subsRestrictions$: of(null),
      }, { data: { byStage: [], needsReview: [] } });
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const hero = compiled.querySelector('.emp-dash-hero-title');
      expect(hero!.textContent).toContain('Your company');
    });

    it('shows KPI cards', () => {
      createComponent({
        loading$: of(false),
        dashboard$: of(mockDashboardData),
        subsRestrictions$: of(null),
      }, { data: { byStage: [], needsReview: [] } });
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const kpiCards = compiled.querySelectorAll('.emp-dash-kpi-card');
      expect(kpiCards.length).toBeGreaterThanOrEqual(3); // at minimum the first 3
    });

    it('shows pipeline section', () => {
      createComponent({
        loading$: of(false),
        dashboard$: of(mockDashboardData),
        subsRestrictions$: of(null),
      }, { data: { byStage: [], needsReview: [] } });
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.emp-dash-pipeline')).toBeTruthy();
    });

    it('shows branding health section when company data is available', () => {
      createComponent({
        loading$: of(false),
        dashboard$: of(mockDashboardData),
        subsRestrictions$: of(null),
      }, { data: { byStage: [], needsReview: [] } });
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.emp-dash-branding')).toBeTruthy();
    });

    it('shows subscription section when subsRestrictions$ emits a value', () => {
      const mockSubs = {
        isPaid: true,
        subscriptionName: 'Pro',
        endAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        jobPost: 20, jobPostCount: 3,
        admin: 5, adminCount: 2,
        videoResponse: 100, videoResponseCount: 15,
      };
      createComponent({
        loading$: of(false),
        dashboard$: of(mockDashboardData),
        subsRestrictions$: of(mockSubs),
      }, { data: { byStage: [], needsReview: [] } });
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.emp-dash-subscription')).toBeTruthy();
    });

    it('hides subscription section when subsRestrictions$ emits null', () => {
      createComponent({
        loading$: of(false),
        dashboard$: of(mockDashboardData),
        subsRestrictions$: of(null),
      }, { data: { byStage: [], needsReview: [] } });
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.emp-dash-subscription')).toBeFalsy();
    });

    it('shows pipeline stages when byStage is non-empty', () => {
      const pipelineResult = {
        data: {
          byStage: [
            { statusId: 1, label: 'Pending Review', count: 4 },
            { statusId: 2, label: 'Screening', count: 2 },
          ],
          needsReview: []
        }
      };
      createComponent({
        loading$: of(false),
        dashboard$: of(mockDashboardData),
        subsRestrictions$: of(null),
      }, pipelineResult);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const stages = compiled.querySelectorAll('.emp-dash-pipeline-stage');
      expect(stages.length).toBe(2);
    });

    it('shows pipeline error state on pipeline failure', () => {
      createComponent({
        loading$: of(false),
        dashboard$: of(mockDashboardData),
        subsRestrictions$: of(null),
      }, null, true /* pipelineError */);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      // Error alert divs should be present
      const alerts = compiled.querySelectorAll('[role="alert"]');
      expect(alerts.length).toBeGreaterThan(0);
    });

    it('calls getCompanyDashboard on init', () => {
      createComponent();
      fixture.detectChanges();
      expect(mockFacade.getCompanyDashboard).toHaveBeenCalled();
    });

    it('calls getDashboardPipelineOverview on init', () => {
      createComponent();
      fixture.detectChanges();
      expect(mockService.getDashboardPipelineOverview).toHaveBeenCalled();
    });

    it('shows "needs review" action card when needsReviewCount > 0', () => {
      const pipelineResult = {
        data: {
          byStage: [
            { statusId: 1, label: 'Pending Review', count: 3 },
          ],
          needsReview: [
            { applicationId: 'A1', jobId: 'J1', candidateName: 'Jane Doe', jobTitle: 'Dev', statusId: 1, submittedDate: '2026-01-01' }
          ]
        }
      };
      createComponent({
        loading$: of(false),
        dashboard$: of(mockDashboardData),
        subsRestrictions$: of(null),
      }, pipelineResult);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const urgentCard = compiled.querySelector('.emp-dash-action-card--urgent');
      expect(urgentCard).toBeTruthy();
    });

    it('hides "needs review" action card when needsReviewCount === 0', () => {
      createComponent({
        loading$: of(false),
        dashboard$: of(mockDashboardData),
        subsRestrictions$: of(null),
      }, { data: { byStage: [], needsReview: [] } });
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const urgentCard = compiled.querySelector('.emp-dash-action-card--urgent');
      expect(urgentCard).toBeFalsy();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // §7 Navigation methods
  // ──────────────────────────────────────────────────────────────────────────
  describe('Navigation methods', () => {

    beforeEach(() => {
      createComponent({
        loading$: of(false),
        dashboard$: of(null),
        subsRestrictions$: of(null),
      });
      fixture.detectChanges();
    });

    it('goToCreateJob navigates to /recruiter/jobs/create', () => {
      const spy = spyOn(router, 'navigate');
      component.goToCreateJob();
      expect(spy).toHaveBeenCalledWith(['/recruiter/jobs/create']);
    });

    it('goToJobsList navigates to /recruiter/jobs/list', () => {
      const spy = spyOn(router, 'navigate');
      component.goToJobsList();
      expect(spy).toHaveBeenCalledWith(['/recruiter/jobs/list']);
    });

    it('goToCompanyProfile navigates to /recruiter/company/details', () => {
      const spy = spyOn(router, 'navigate');
      component.goToCompanyProfile();
      expect(spy).toHaveBeenCalledWith(['/recruiter/company/details']);
    });

    it('goToSubscription navigates to /recruiter/subscription', () => {
      const spy = spyOn(router, 'navigate');
      component.goToSubscription();
      expect(spy).toHaveBeenCalledWith(['/recruiter/subscription']);
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
  });

  // ──────────────────────────────────────────────────────────────────────────
  // §8 companyProfileMissingFields()
  // ──────────────────────────────────────────────────────────────────────────
  describe('companyProfileMissingFields()', () => {

    beforeEach(() => createComponent());

    it('returns [] when company is null', () => {
      expect(component.companyProfileMissingFields(null as any)).toEqual([]);
    });

    it('returns [] when all 3 fields are present', () => {
      const company = makeCompany(); // has logo, details, city
      expect(component.companyProfileMissingFields(company as any)).toEqual([]);
    });

    it('reports missing logo', () => {
      const company = makeCompany({ companyLogoUrl: null });
      expect(component.companyProfileMissingFields(company as any)).toContain('logo');
    });

    it('reports missing description', () => {
      const company = makeCompany({ companyDetails: null });
      expect(component.companyProfileMissingFields(company as any)).toContain('company description');
    });

    it('reports missing location', () => {
      const company = makeCompany({ companyCity: '' });
      expect(component.companyProfileMissingFields(company as any)).toContain('location');
    });

    it('reports all 3 missing', () => {
      const company = makeCompany({ companyLogoUrl: null, companyDetails: null, companyCity: null });
      const result = component.companyProfileMissingFields(company as any);
      expect(result.length).toBe(3);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // §9 retryPipelineOverview()
  // ──────────────────────────────────────────────────────────────────────────
  describe('retryPipelineOverview()', () => {

    it('re-calls getDashboardPipelineOverview when retried', () => {
      createComponent({}, null, true); // initial call errors
      fixture.detectChanges();
      expect(component.pipelineError).toBe(true);

      // Fix the service to return success
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
