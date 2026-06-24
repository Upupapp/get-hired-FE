import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CompanyFacade } from '../state/company.facade';
import { CompanyService } from '../company.service';
import * as Model from '../company.model';
import { map } from 'rxjs';

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

  constructor(
    private companyFacade: CompanyFacade,
    private companyService: CompanyService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.companyFacade.getCompanyDashboard();
    this.loadPipelineOverview();
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
        this.pipelineLoading = false;
      },
      error: () => {
        this.pipelineLoading = false;
        this.pipelineError = true;
      }
    });
  }

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
}
