import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { JobFacade } from '@app-job/state/job.facade';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { Subject } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';
// B13: Job Readiness — compact optional improvements indicator
import { JobReadinessService, JobReadinessResult } from '@app-job/services/job-readiness.service';

/**
 * RecruiterJobDashboardComponent — job-level command center.
 *
 * Reached immediately after a recruiter publishes a job post.
 * Route: /recruiter/jobs/dashboard?id=<jobId>
 *
 * Design rules (B05 V1):
 * - NEVER fakes applicant counts or analytics
 * - Shows real job data from the store; falls back gracefully on load error
 * - All animations respect prefers-reduced-motion via _motion.scss mixins
 * - Public job link: links to /jobs/details/<jobId> (public portal)
 * - Company scoping: job data is fetched server-side with ownership checks
 */
@Component({
  selector: 'app-employer-job-dashboard',
  templateUrl: './employer-job-dashboard.component.html',
  styleUrls: ['./employer-job-dashboard.component.scss'],
  animations: [mainAnimations],
})
export class EmployerJobDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  jobId: string | null = null;
  loading = true;
  loadError = false;

  job$ = this.jobFacade.getJobById$;

  /** B13: Computed once when job data arrives — shows optional improvements chip */
  dashboardReadiness: JobReadinessResult | null = null;
  /** Only show improvements chip if published job has recommended gaps */
  get hasOptionalImprovements(): boolean {
    return !!(this.dashboardReadiness &&
      this.dashboardReadiness.canPublish &&
      this.dashboardReadiness.recommendationItems.length > 0);
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private jobFacade: JobFacade,
    // B13
    private jobReadiness: JobReadinessService,
  ) {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.jobId = params.id || null;
      });
  }

  ngOnInit(): void {
    // Track loading state from the store
    this.jobFacade.getJobLoading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isLoading => {
        this.loading = isLoading;
      });

    // Track job error state from the store
    this.jobFacade.jobError$
      .pipe(takeUntil(this.destroy$))
      .subscribe(err => {
        this.loadError = !!err;
      });

    if (this.jobId) {
      this.jobFacade.getJobById(this.jobId);
    } else {
      // No jobId in query params — try to use the last saved job from the store
      this.jobFacade.jobDetails$
        .pipe(take(1))
        .subscribe(selected => {
          if (selected && selected.jobId) {
            this.jobId = selected.jobId;
            this.jobFacade.getJobById(this.jobId);
          } else {
            // Nothing we can use — fall back to job list with a message
            this.router.navigate(['/recruiter/jobs/list']);
          }
        });
    }

    // B13: Compute readiness once job data arrives (published jobs only)
    this.jobFacade.getJobById$
      .pipe(takeUntil(this.destroy$))
      .subscribe(job => {
        if (job) {
          this.dashboardReadiness = this.jobReadiness.evaluate({
            jobTitle:       job.jobTitle,
            jobTypeId:      job.jobTypeId,
            jobLevelId:     job.jobLevelId,
            jobCity:        job.jobCity,
            jobCountry:     job.jobCountry,
            jobDescription: job.jobDescription,
            jobDuties:      job.jobDuties,
            workSetupId:    job.workSetupId,
            jobBanner:      job.jobBanner,
            companyId:      job.companyId,
            skills:         job.skills,
            requirements:   job.requirements,
            companyLogoUrl: job.companyLogoUrl,
            companyDetails: job.companyDetails,
            interviewQuestions: job.interviewQuestions,
            educationalBackground: job.educationalBackground,
          });
        }
      });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  viewPublicJob(): void {
    if (this.jobId) {
      // Opens the public job detail page in a new tab so the recruiter
      // stays on the dashboard — never navigates away without intent.
      window.open(`/jobs/details/${this.jobId}`, '_blank', 'noopener,noreferrer');
    }
  }

  viewApplicants(): void {
    if (this.jobId) {
      this.router.navigate(['/recruiter/jobs/applicants'], {
        queryParams: { id: this.jobId }
      });
    }
  }

  editJob(): void {
    if (this.jobId) {
      this.router.navigate(['/recruiter/jobs/edit'], {
        queryParams: { id: this.jobId }
      });
    }
  }

  backToAllJobs(): void {
    this.router.navigate(['/recruiter/jobs/list']);
  }

  createAnotherJob(): void {
    this.router.navigate(['/recruiter/jobs/create']);
  }

  getStatusLabel(job: any): string {
    if (!job) return '';
    switch (job.jobStatusId) {
      case 2: return 'Published';
      case 1: return 'Draft';
      case 3: return 'Expired';
      case 4: return 'Archived';
      default: return 'Live';
    }
  }

  getStatusClass(job: any): string {
    if (!job) return '';
    switch (job.jobStatusId) {
      case 2: return 'status-published';
      case 1: return 'status-draft';
      case 3: return 'status-expired';
      case 4: return 'status-archived';
      default: return 'status-published';
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
