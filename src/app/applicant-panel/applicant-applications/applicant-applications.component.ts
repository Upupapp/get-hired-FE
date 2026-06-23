import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApplicantApplicationsService } from '@app-applicant/applicant-applications.service';

/**
 * "My Applications" page (GH-ACT applicant-experience work).
 *
 * Honest by design: the backing tables (job_applicants/job_applicant_status)
 * do not exist in the live schema today (confirmed via a direct database
 * query) -- so this will currently always show either the empty state or
 * the error-fallback state for every real user, never populated data. That
 * is correct, not a bug: the page is built and ready, the data layer isn't.
 * See GETHIRED_APPLICANT_DATA_MODEL_AUDIT.md.
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

  retry(): void {
    this.loading = true;
    this.error = false;
    this.ngOnInit();
  }
}
