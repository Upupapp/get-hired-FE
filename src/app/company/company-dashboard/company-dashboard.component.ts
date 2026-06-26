import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CompanyFacade } from '../state/company.facade';
import { CompanyService } from '../company.service';
import { SeoService } from '@app-core/services/seo.service';
import * as Model from '../company.model';
import { map, tap, catchError, of, Subject, takeUntil } from 'rxjs';

interface PipelineStage {
  statusId: number;
  label: string;
  count: number;
}

interface NeedsReviewItem {
  applicationId: string;
  jobId: string;
  candidateName: string;
  jobTitle: string;
  statusId: number;
  submittedDate: string;
}

interface RecommendedStep {
  type: string;
  title: string;
  reason: string;
  ctaLabel: string;
  route: string;
  priority: 'high' | 'medium' | 'low' | 'success';
  count?: number;
}

interface SupportingAction {
  type: string;
  label: string;
  desc: string;
  cta: string;
  count?: number;
  priority: 'high' | 'medium' | 'low';
  route: string;
}

@Component({
  selector: 'app-company-dashboard',
  templateUrl: './company-dashboard.component.html',
  styleUrls: ['./company-dashboard.component.scss']
})
export class CompanyDashboardComponent implements OnInit, OnDestroy {
  company: Model.Company;
  stat: any;
  charts: any;

  private _destroy$ = new Subject<void>();

  loading$ = this.companyFacade.loading$;

  dashboard$ = this.companyFacade.dashboard$
    .pipe(
      map(dash => {
        if (dash) {
          return {
            company: dash.company,
            charts: dash.charts,
            graph: {
              graph: dash.graph,
              statistic: dash.statistic,
              jobViews: dash.jobViews
            },
            stat: {
              totalContacts: dash.totalContacts,
              cities: dash.cities
            }
          };
        }
      }),
      tap(dash => {
        if (dash) {
          this._lastDashboardCompany = dash.company;
          this._lastDashboardCharts = dash.charts;
          this._refreshOnboardingCache();
          if (dash.company) {
            this.cachedBrandingScore = this.brandingScore(dash.company);
            this.cachedProfileMissingFields = this.companyProfileMissingFields(dash.company);
            this.cachedProfilePct = this.cachedBrandingScore ? this.cachedBrandingScore.score : 0;
          } else {
            this.cachedBrandingScore = null;
            this.cachedProfileMissingFields = [];
            this.cachedProfilePct = 0;
          }
          // V5: job views this month + conversion rate from graph data
          this._computeJobViewsCache(dash.graph);
          // V5: cities from stat
          this._computeCitiesCache(dash.stat);
          // V5: hiring health + recommended step + supporting actions
          this._refreshV5Cache();
        }
      })
    );

  /** Fetched independently so a failure here never blanks the charts/stat widgets. */
  pipelineLoading = true;
  pipelineError = false;
  byStage: PipelineStage[] = [];
  needsReview: NeedsReviewItem[] = [];
  needsReviewCount = 0;
  pipelineBarMax = 1;

  /** subsRestrictions$ wrapped with catchError so the section shows a retry state. */
  subsError = false;
  subsRestrictions$ = this.companyFacade.subsRestrictions$.pipe(
    tap(() => { this.subsError = false; }),
    catchError(() => { this.subsError = true; return of(null); })
  );

  cachedJobGroups: Array<{ jobId: string; jobTitle: string; count: number }> = [];

  /** brandingScore() cached here; refreshed only on dashboard$ emit. */
  cachedBrandingScore: { score: number; missing: string[] } | null = null;

  /** companyProfileMissingFields() cached here; refreshed only on dashboard$ emit. */
  cachedProfileMissingFields: string[] = [];

  // ── V5 properties ───────────────────────────────────────────────────────────
  /** Profile completeness percentage (0–100), derived from brandingScore. */
  cachedProfilePct = 0;

  /** Job views for the current calendar month, summed from graph.jobViews. */
  cachedJobViewsThisMonth = 0;

  /** Conversion rate string (e.g. "6.9%"), null when no job views. */
  cachedConversionRate: string | null = null;

  /** Count of interview-scheduled applicants from byStage. */
  cachedInterviewsScheduled = 0;

  /** Total applicants across all pipeline stages. */
  cachedPipelineTotal = 0;

  /** Overall hiring health status derived from key indicators. */
  cachedHiringHealth: 'good' | 'attention' | 'unknown' = 'unknown';

  /** Highest-priority recommended action for the Action Inbox main card. */
  cachedRecommendedStep: RecommendedStep | null = null;

  /** Up to 4 supporting action cards shown alongside the recommended step. */
  cachedSupportingActions: SupportingAction[] = [];

  /** Cities data (array) computed from stat.cities (handles nested or flat). */
  cachedCities: Array<{ city: string; count: string }> = [];

  /** Active time-range selector for the Views & Applications chart (UI only). */
  trendRange: '7d' | '30d' | '90d' = '30d';

  asyncLocalStorage = {
    getItem: async function (key: string) {
      await Promise.resolve();
      return localStorage.getItem(key);
    }
  };

  /** cachedOnboardingSteps: refreshed when dashboard$ emits or pipeline loads. */
  cachedOnboardingSteps: Array<{
    title: string; desc: string; cta: string; done: boolean; action: () => void;
  }> = [];

  constructor(
    private companyFacade: CompanyFacade,
    private companyService: CompanyService,
    private router: Router,
    private seoService: SeoService,
  ) { }

  ngOnInit(): void {
    // Dashboard is auth-gated — prevent indexing.
    this.seoService.setPageMeta({ title: 'Dashboard — GetHired Online', description: '', robots: 'noindex, nofollow' });

    this.companyFacade.getCompanyDashboard();
    this.loadPipelineOverview();
    this.asyncLocalStorage.getItem('user').then(details => {
      if (details) {
        const user = JSON.parse(details);
        if (user && user.companyId) {
          this.companyFacade.getCompanySubscription(user.companyId);
        }
      }
    });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private loadPipelineOverview(): void {
    this.pipelineLoading = true;
    this.pipelineError = false;
    this.companyService.getDashboardPipelineOverview().subscribe({
      next: (res: any) => {
        this.byStage = res && res.data && res.data.byStage ? res.data.byStage : [];
        this.needsReview = res && res.data && res.data.needsReview ? res.data.needsReview : [];
        this.needsReviewCount =
          (this.byStage.find(s => s.statusId === 1) ? this.byStage.find(s => s.statusId === 1).count : 0) +
          (this.byStage.find(s => s.statusId === 3) ? this.byStage.find(s => s.statusId === 3).count : 0);
        this.pipelineBarMax = Math.max(1, ...this.byStage.map(s => s.count));
        this.cachedJobGroups = this._buildJobGroups(this.needsReview);
        this.pipelineLoading = false;
        this._refreshOnboardingCache();
        this._refreshV5Cache();
      },
      error: () => {
        this.pipelineLoading = false;
        this.pipelineError = true;
        this._refreshV5Cache();
      }
    });
  }

  /** Refreshes onboarding checklist cache from last dashboard + pipeline data. */
  private _refreshOnboardingCache(): void {
    this.cachedOnboardingSteps = this.onboardingSteps(
      this._lastDashboardCompany, this._lastDashboardCharts
    );
  }

  /** V5: refreshes hiring health, pipeline totals, recommended step, and supporting actions. */
  private _refreshV5Cache(): void {
    const charts = this._lastDashboardCharts;
    this.cachedPipelineTotal = this.byStage.reduce((s, st) => s + (st.count || 0), 0);
    // Interview-scheduled stage: find by label (handle varying stage labels)
    const intStage = this.byStage.find(
      s => s.label && s.label.toLowerCase().indexOf('interview') !== -1 &&
           s.label.toLowerCase().indexOf('question') === -1 &&
           s.label.toLowerCase().indexOf('sched') !== -1
    );
    this.cachedInterviewsScheduled = intStage ? (intStage.count || 0) : 0;
    const score = this.cachedBrandingScore ? this.cachedBrandingScore.score : 0;
    if (this.needsReviewCount > 10 || score < 50) {
      this.cachedHiringHealth = 'attention';
    } else if (this.needsReviewCount > 0 || score >= 50) {
      this.cachedHiringHealth = 'good';
    } else {
      this.cachedHiringHealth = 'unknown';
    }
    this._buildRecommendedStep(charts);
    this._buildSupportingActions(charts);
  }

  /** V5: compute job views this month and conversion rate from graph data. */
  private _computeJobViewsCache(graph: any): void {
    if (!graph || !Array.isArray(graph.jobViews)) {
      this.cachedJobViewsThisMonth = 0;
      this.cachedConversionRate = null;
      return;
    }
    const now = new Date();
    const cm = now.getMonth();
    const cy = now.getFullYear();
    let total = 0;
    for (var i = 0; i < graph.jobViews.length; i++) {
      var row = graph.jobViews[i];
      var d = new Date(row.date);
      if (d.getFullYear() === cy && d.getMonth() === cm) {
        total += parseInt(String(row.count), 10) || 0;
      }
    }
    this.cachedJobViewsThisMonth = total;
    var applicants = this._lastDashboardCharts ? (parseInt(String(this._lastDashboardCharts.applicants), 10) || 0) : 0;
    this.cachedConversionRate = total > 0 ? ((applicants / total) * 100).toFixed(1) + '%' : null;
  }

  /** V5: normalize cities from stat (handles both nested {cities:[...]} and flat array). */
  private _computeCitiesCache(stat: any): void {
    if (!stat) { this.cachedCities = []; return; }
    var raw = stat.cities;
    if (!raw) { this.cachedCities = []; return; }
    if (Array.isArray(raw)) {
      this.cachedCities = raw;
    } else if (raw && Array.isArray(raw.cities)) {
      this.cachedCities = raw.cities;
    } else {
      this.cachedCities = [];
    }
  }

  /** V5: derives the highest-priority recommended next step. */
  private _buildRecommendedStep(charts: any): void {
    var activeJobs = charts ? (parseInt(String(charts.activeJobs), 10) || 0) : 0;
    var interviews = charts ? (parseInt(String(charts.interviews), 10) || 0) : 0;
    var score = this.cachedBrandingScore ? this.cachedBrandingScore.score : 0;
    var missingCount = this.cachedProfileMissingFields ? this.cachedProfileMissingFields.length : 0;

    if (missingCount >= 2) {
      this.cachedRecommendedStep = {
        type: 'complete_company_profile', priority: 'high',
        title: 'Complete your company profile',
        reason: 'Candidates are more likely to apply when they can see who is hiring.',
        ctaLabel: 'Complete profile', route: '/recruiter/company/details'
      };
    } else if (activeJobs === 0) {
      this.cachedRecommendedStep = {
        type: 'post_first_job', priority: 'high',
        title: 'Post your first job',
        reason: 'Create a job post to start receiving applications from qualified candidates.',
        ctaLabel: 'Post a job', route: '/recruiter/jobs/create'
      };
    } else if (this.needsReviewCount > 0) {
      this.cachedRecommendedStep = {
        type: 'review_applicants', priority: 'high',
        title: 'Review new applicants',
        reason: 'New applicants match your recent job posts and are waiting for your review.',
        ctaLabel: 'Review applicants', route: '/recruiter/jobs/list',
        count: this.needsReviewCount
      };
    } else if (interviews > 0) {
      this.cachedRecommendedStep = {
        type: 'review_video_answers', priority: 'medium',
        title: 'Review video answers',
        reason: 'Candidates have submitted video answers to your interview questions.',
        ctaLabel: 'Review videos', route: '/recruiter/jobs/list', count: interviews
      };
    } else if (score < 80) {
      this.cachedRecommendedStep = {
        type: 'improve_employer_brand', priority: 'low',
        title: 'Strengthen your employer brand',
        reason: 'A stronger profile helps you stand out and attract more qualified candidates.',
        ctaLabel: 'Improve branding', route: '/recruiter/company/details'
      };
    } else {
      this.cachedRecommendedStep = {
        type: 'all_caught_up', priority: 'success',
        title: 'All caught up',
        reason: 'Your hiring workspace has no urgent tasks right now. Keep it up!',
        ctaLabel: 'View jobs', route: '/recruiter/jobs/list'
      };
    }
  }

  /** V5: builds up to 4 supporting action cards for the Action Inbox. */
  private _buildSupportingActions(charts: any): void {
    var actions: SupportingAction[] = [];
    var interviews = charts ? (parseInt(String(charts.interviews), 10) || 0) : 0;

    if (this.needsReviewCount > 0) {
      actions.push({
        type: 'review_applicants', priority: 'high', count: this.needsReviewCount,
        label: 'Review applicants',
        desc: this.needsReviewCount + ' applicant' + (this.needsReviewCount === 1 ? '' : 's') + ' waiting for review.',
        cta: 'Review applicants', route: '/recruiter/jobs/list'
      });
    }
    if (interviews > 0) {
      actions.push({
        type: 'review_videos', priority: 'high', count: interviews,
        label: 'Review video answers',
        desc: interviews + ' video answer' + (interviews === 1 ? '' : 's') + ' need review.',
        cta: 'Review videos', route: '/recruiter/jobs/list'
      });
    }
    actions.push({
      type: 'messages', priority: 'medium',
      label: 'Reply to candidate messages',
      desc: 'View all candidate conversations in one place.',
      cta: 'Open messages', route: '/recruiter/messages'
    });
    if (this.cachedProfileMissingFields && this.cachedProfileMissingFields.length > 0) {
      actions.push({
        type: 'complete_profile', priority: 'medium',
        label: 'Complete company profile',
        desc: 'Missing: ' + this.cachedProfileMissingFields.join(', ') + '.',
        cta: 'Complete profile', route: '/recruiter/company/details'
      });
    }
    this.cachedSupportingActions = actions.slice(0, 4);
  }

  private _lastDashboardCompany: any = null;
  private _lastDashboardCharts: any = null;

  retryPipelineOverview(): void {
    this.loadPipelineOverview();
  }

  retrySubscription(): void {
    this.subsError = false;
    this.asyncLocalStorage.getItem('user').then(details => {
      if (details) {
        const user = JSON.parse(details);
        if (user && user.companyId) {
          this.companyFacade.getCompanySubscription(user.companyId);
        }
      }
    });
  }

  goToCreateJob(): void {
    this.router.navigate(['/recruiter/jobs/create']);
  }

  goToApplicants(jobId?: string): void {
    if (jobId) {
      this.router.navigate(['/recruiter/jobs/applicants'], { queryParams: { id: jobId } });
    } else {
      this.router.navigate(['/recruiter/jobs/list']);
    }
  }

  goToJobsList(): void {
    this.router.navigate(['/recruiter/jobs/list']);
  }

  goToCompanyProfile(): void {
    this.router.navigate(['/recruiter/company/details']);
  }

  goToMessages(): void {
    this.router.navigate(['/recruiter/messages']);
  }

  goToSubscription(): void {
    this.router.navigate(['/recruiter/subscription']);
  }

  /** V5: navigates to any route by URL string (used by inbox cards). */
  navigateTo(route: string): void {
    this.router.navigateByUrl(route);
  }

  /** V5: fires the recommended step CTA. */
  onRecommendedStepCta(): void {
    if (this.cachedRecommendedStep) {
      this.navigateTo(this.cachedRecommendedStep.route);
    }
  }

  /** V5: sets the active time range for the views/applications chart UI. */
  setTrendRange(range: '7d' | '30d' | '90d'): void {
    this.trendRange = range;
  }

  companyProfileMissingFields(company: Model.Company): string[] {
    if (!company) { return []; }
    const missing: string[] = [];
    if (!company.companyLogoUrl) { missing.push('logo'); }
    if (!company.companyDetails) { missing.push('company description'); }
    if (!company.companyCity) { missing.push('location'); }
    return missing;
  }

  // ── trackBy functions ────────────────────────────────────────────────────────
  trackByStageId(_index: number, stage: PipelineStage): number {
    return stage.statusId;
  }

  trackByIndex(i: number): number {
    return i;
  }

  trackByApplicationId(_index: number, item: NeedsReviewItem): string {
    return item.applicationId;
  }

  trackOnboardingStep(index: number): number {
    return index;
  }

  onboardingSteps(company: Model.Company, charts: any): Array<{
    title: string; desc: string; cta: string; done: boolean; action: () => void;
  }> {
    const hasLogo = !!(company && company.companyLogoUrl);
    const hasDescription = !!(company && company.companyDetails);
    const hasLocation = !!(company && company.companyCity);
    const hasActiveJob = (charts && charts.activeJobs ? charts.activeJobs : 0) > 0;

    const steps = [
      {
        title: 'Complete your company profile',
        desc: 'Add your logo, description, and location so candidates know who is hiring.',
        cta: 'Complete profile',
        done: hasLogo && hasDescription && hasLocation,
        action: () => this.goToCompanyProfile()
      },
      {
        title: 'Post your first job',
        desc: 'Create a job post to start receiving applications from qualified candidates.',
        cta: 'Post a job',
        done: hasActiveJob,
        action: () => this.goToCreateJob()
      },
      {
        title: 'Review your first applicants',
        desc: 'Once candidates apply, review their profiles and video answers here.',
        cta: 'View applicants',
        done: (this.byStage.reduce((sum, s) => sum + s.count, 0) || 0) > 0,
        action: () => this.goToApplicants()
      }
    ];

    const allDone = steps.every(s => s.done);
    return allDone ? [] : steps;
  }

  private _buildJobGroups(items: NeedsReviewItem[]): Array<{ jobId: string; jobTitle: string; count: number }> {
    if (!items || !items.length) { return []; }
    const map: Record<string, { jobTitle: string; count: number }> = {};
    for (const item of items) {
      if (!map[item.jobId]) {
        map[item.jobId] = { jobTitle: item.jobTitle, count: 0 };
      }
      map[item.jobId].count++;
    }
    return Object.entries(map)
      .map(([jobId, v]) => ({ jobId, jobTitle: v.jobTitle, count: v.count }))
      .sort((a, b) => b.count - a.count);
  }

  brandingScore(company: Model.Company): { score: number; missing: string[] } {
    if (!company) { return { score: 0, missing: [] }; }
    const missing: string[] = [];
    if (!company.companyLogoUrl) { missing.push('company logo'); }
    if (!company.companyDetails) { missing.push('description'); }
    if (!company.companyCity) { missing.push('location'); }
    if (company.industryId == null) { missing.push('industry'); }
    if (!company.numberOfEmployee) { missing.push('team size'); }
    if (!company.companyContactNumber) { missing.push('contact number'); }
    const total = 6;
    const score = Math.round(((total - missing.length) / total) * 100);
    return { score, missing };
  }

  subscriptionDaysLeft(endAt: any): number {
    if (!endAt) { return 0; }
    const end = new Date(endAt);
    if (isNaN(end.getTime())) { return 0; }
    const now = new Date();
    return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  }

  subscriptionUsagePct(used: number, limit: number): number {
    if (!limit || limit === 0) { return 0; }
    return Math.min(100, Math.round((used / limit) * 100));
  }
}
