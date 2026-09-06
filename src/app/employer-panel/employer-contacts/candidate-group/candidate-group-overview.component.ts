import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { JobService } from '@app-job/job.service';
import { SnackbarService } from '@app-core/services/snackbar.service';
import { mainAnimations } from '@app-shared/animations/main-animations';

export interface JobApplicantSummary {
  jobId: string;
  jobTitle: string;
  totalApplicants: number;
  hiredCount: number;
  rejectedCount: number;
}

// CANDIDATE-GROUP-V1: replaces "Talent Pool"/old manual "Candidate Groups"/
// old "Applicants" (all now unlinked from the sidebar, not deleted -- see
// employer-sidebar.component.ts). This is a purely job-derived view: one
// card per job that has at least one applicant (enforced server-side by
// GET /job/applicant-summary), showing total/Hired/Rejected counts.
// Clicking a card drills into CandidateGroupDetailComponent, which shows
// only that job's Hired/Rejected applicants as avatar+CV cards.
@Component({
  selector: 'app-candidate-group-overview',
  templateUrl: './candidate-group-overview.component.html',
  styleUrls: ['./candidate-group-overview.component.scss'],
  animations: [mainAnimations],
})
export class CandidateGroupOverviewComponent implements OnInit {
  loading = true;
  jobSummaries: JobApplicantSummary[] = [];

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
        this.snackbarService.error("We couldn't load your candidate groups right now. Please try again.", '');
      },
    });
  }

  openGroup(job: JobApplicantSummary): void {
    this.router.navigate(['/recruiter/contacts/job-groups', job.jobId]);
  }
}
