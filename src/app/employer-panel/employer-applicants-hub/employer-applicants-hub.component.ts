import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { JobService } from '@app-job/job.service';
import { SnackbarService } from '@app-core/services/snackbar.service';
import { mainAnimations } from '@app-shared/animations/main-animations';

export interface JobApplicantSummaryRow {
  jobId: string;
  jobTitle: string;
  totalApplicants: number;
  hiredCount: number;
  rejectedCount: number;
}

// CANDIDATE-GROUP-V1: promotes the per-job Applicants view (previously
// only reachable via a "Review Applicants" button buried inside Jobs)
// into its own top-level sidebar section. This is the landing page --
// a job picker with applicant counts -- clicking a row lands on the
// existing, unchanged JobApplicantsComponent at /recruiter/jobs/applicants,
// which already has the full applicant table, status changes, and CV
// access.
@Component({
  selector: 'app-employer-applicants-hub',
  templateUrl: './employer-applicants-hub.component.html',
  styleUrls: ['./employer-applicants-hub.component.scss'],
  animations: [mainAnimations],
})
export class EmployerApplicantsHubComponent implements OnInit {
  loading = true;
  jobSummaries: JobApplicantSummaryRow[] = [];

  constructor(
    private router: Router,
    private jobService: JobService,
    private snackbarService: SnackbarService,
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.jobService.getJobApplicantSummary().subscribe({
      next: (res: any) => {
        this.jobSummaries = res?.data || [];
        this.loading = false;
      },
      error: () => {
        this.jobSummaries = [];
        this.loading = false;
        this.snackbarService.error("We couldn't load your applicants right now. Please try again.", '');
      },
    });
  }

  openJobApplicants(job: JobApplicantSummaryRow): void {
    this.router.navigate(['/recruiter/jobs/applicants'], { queryParams: { id: job.jobId } });
  }
}
