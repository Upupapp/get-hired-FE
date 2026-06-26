import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CompanyFacade } from '../state/company.facade';
import { CompanyService } from '../company.service';
import * as Model from '../company.model';
import { map, tap } from 'rxjs';

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

@Component({
  selector: 'app-company-dashboard',
  templateUrl: './company-dashboard.component.html',
  styleUrls: ['./company-dashboard.component.scss']
})
export class CompanyDashboardComponent implements OnInit {
  company: Model.Company;
  stat: any;
  charts: any;

  loading$ = this.companyFacade.loading$;

  dashboard$ = this.companyFacade.dashboard$
    .pipe(
      map(dash => {
        if(dash) {
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
          }
        }
      }),
      // OPTIMIZE V5: cache company/charts for the onboarding step cache refresh.
      // tap does not alter the emitted value seen by the template's async pipe.
      tap(dash => {
        if (dash) {
          this._lastDashboardCompany = dash.company;
          this._lastDashboardCharts = dash.charts;
          this._refreshOnboardingCache();
        }
      })
    );

  /** GETHIRED_EMPLOYER_DASHBOARD_WORLD_CLASS_TECHY_REDESIGN_V2 -- fetched
   * independently of dashboard$ (own loading/error state) so a failure
   * here never blanks the charts/stat widgets above, and vice versa. */
  pipelineLoading = true;
  pipelineError = false;
  byStage: PipelineStage[] = [];
  needsReview: NeedsReviewItem[] = [];
  /** OPTIMIZE: cached once when pipeline data arrives, not recomputed per
   * change-detection tick. Both values are used 3–6 times in the template. */
  needsReviewCount = 0;
  pipelineBarMax = 1;
  subsRestrictions$ = this.companyFacade.subsRestrictions$;
  cachedJobGroups: Array<{ jobId: string; jobTitle: string; count: number }> = [];

  asyncLocalStorage = {
    getItem: async function (key: string) {
      await Promise.resolve();
      return localStorage.getItem(key);
    }
  };

  /** OPTIMIZE V5: cached result of onboardingSteps() so the template can
   * reference cachedOnboardingSteps directly instead of calling the method
   * twice per change-detection cycle (once for *ngIf, once for *ngFor).
   * Refreshed whenever dashboard$ emits or pipeline data arrives. */
  cachedOnboardingSteps: Array<{
    title: string; desc: string; cta: string; done: boolean; action: () => void;
  }> = [];

  constructor(
    private companyFacade: CompanyFacade,
    private companyService: CompanyService,
    private router: Router,
  ) { }

  ngOnInit(): void {
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

  private loadPipelineOverview(): void {
    this.pipelineLoading = true;
    this.pipelineError = false;
    this.companyService.getDashboardPipelineOverview().subscribe({
      next: (res: any) => {
        this.byStage = res?.data?.byStage || [];
        this.needsReview = res?.data?.needsReview || [];
        this.needsReviewCount =
          (this.byStage.find(s => s.statusId === 1)?.count || 0) +
          (this.byStage.find(s => s.statusId === 3)?.count || 0);
        this.pipelineBarMax = Math.max(1, ...this.byStage.map(s => s.count));
        this.cachedJobGroups = this._buildJobGroups(this.needsReview);
        this.pipelineLoading = false;
        // OPTIMIZE V5: refresh cached steps now that needsReviewCount is known.
        // Must be done after pipelineLoading=false or the section stays hidden.
        this._refreshOnboardingCache();
      },
      error: () => {
        this.pipelineLoading = false;
        this.pipelineError = true;
      }
    });
  }

  /** OPTIMIZE V5: called from ngOnInit (after dashboard$ emits via tap) and
   * from loadPipelineOverview so the cache is always fresh when either data
   * source updates. Reads this.lastDashboardCompany/Charts set by dashboard$. */
  private _refreshOnboardingCache(): void {
    this.cachedOnboardingSteps = this.onboardingSteps(
      this._lastDashboardCompany, this._lastDashboardCharts
    );
  }

  private _lastDashboardCompany: any = null;
  private _lastDashboardCharts: any = null;

  retryPipelineOverview(): void {
    this.loadPipelineOverview();
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

  // B01: Messages inbox CTA from dashboard action center
  goToMessages(): void {
    this.router.navigate(['/recruiter/messages']);
  }

  goToSubscription(): void {
    this.router.navigate(['/recruiter/subscription']);
  }

  /** Real, derived from already-fetched company fields -- not a fake
   * score. Mirrors the applicant-side completeness pattern but kept
   * client-side/lightweight since no backend equivalent exists yet. */
  companyProfileMissingFields(company: Model.Company): string[] {
    if (!company) { return []; }
    const missing: string[] = [];
    if (!company.companyLogoUrl) { missing.push('logo'); }
    if (!company.companyDetails) { missing.push('company description'); }
    if (!company.companyCity) { missing.push('location'); }
    return missing;
  }

  // ── OPTIMIZE V5: trackBy functions ─────────────────────────────────────────
  trackByStageId(_index: number, stage: PipelineStage): number {
    return stage.statusId;
  }

  trackByApplicationId(_index: number, item: NeedsReviewItem): string {
    return item.applicationId;
  }

  trackOnboardingStep(index: number): number {
    return index;
  }

  /** V5 B07: Onboarding checklist steps derived from real company/job data.
   * Returns only incomplete steps when all are complete the section hides.
   * Safe: no fake progress. Charts.activeJobs === 0 means no published jobs. */
  onboardingSteps(company: Model.Company, charts: any): Array<{
    title: string; desc: string; cta: string; done: boolean; action: () => void;
  }> {
    const hasLogo = !!(company?.companyLogoUrl);
    const hasDescription = !!(company?.companyDetails);
    const hasLocation = !!(company?.companyCity);
    const hasActiveJob = (charts?.activeJobs || 0) > 0;

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

    // Return all steps when at least one is incomplete (collapses when all done)
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
    if (!company.industryId) { missing.push('industry'); }
    if (!company.numberOfEmployee) { missing.push('team size'); }
    if (!company.companyContactNumber) { missing.push('contact number'); }
    const total = 6;
    const score = Math.round(((total - missing.length) / total) * 100);
    return { score, missing };
  }

  subscriptionDaysLeft(endAt: any): number {
    if (!endAt) { return 0; }
    const end = new Date(endAt);
    const now = new Date();
    return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  }

  subscriptionUsagePct(used: number, limit: number): number {
    if (!limit || limit === 0) { return 0; }
    return Math.min(100, Math.round((used / limit) * 100));
  }
}
