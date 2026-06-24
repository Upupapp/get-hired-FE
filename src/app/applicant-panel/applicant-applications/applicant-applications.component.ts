import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApplicantApplicationsService } from '@app-applicant/applicant-applications.service';

/**
 * "My Applications" page (GH-ACT applicant-experience work).
 *
 * Update: the backing tables (job_applicants/job_applicant_status) were
 * restored by the Applicant Data Foundation v2 migration
 * (db/applicant_application_ddl.sql) and confirmed to exist in the live
 * local schema -- this comment previously said they didn't (true at the
 * time it was written) and is corrected here. The page now genuinely
 * populates with real data for an applicant who has applied to jobs.
 */
@Component({
  selector: 'app-applicant-applications',
  templateUrl: './applicant-applications.component.html',
  styleUrls: ['./applicant-applications.component.scss'],
})
export class ApplicantApplicationsComponent implements OnInit {
  loading = true;
  error = false;
  applications: any[] = [];
  /** Which application's message panel is currently expanded, if any --
   * GH-EMP-B04 frontend, one panel open at a time keeps this simple. */
  expandedJobId: string | null = null;

  constructor(
    private applicationsService: ApplicantApplicationsService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.applicationsService.getMyApplications().subscribe({
      next: (response: any) => {
        this.applications = response?.data ?? response ?? [];
        this.loading = false;
      },
      error: () => {
        // Never show the raw backend error -- same rule applied everywhere
        // else in this codebase's state-handling work.
        this.error = true;
        this.loading = false;
      },
    });
  }

  goToJobs(): void {
    this.router.navigateByUrl('/jobs');
  }

  toggleMessages(jobId: string): void {
    this.expandedJobId = this.expandedJobId === jobId ? null : jobId;
  }

  retry(): void {
    this.loading = true;
    this.error = false;
    this.ngOnInit();
  }
}
