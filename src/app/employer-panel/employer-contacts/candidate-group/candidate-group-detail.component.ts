import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JobService } from '@app-job/job.service';
import { SnackbarService } from '@app-core/services/snackbar.service';
import { mainAnimations } from '@app-shared/animations/main-animations';

interface GroupApplicant {
  userId: string;
  applicationId: string;
  fullName: string;
  photoUrl: string;
  jobApplicationStatusId: number;
  jobApplicationStatusName: string;
  isHired: boolean;
  isRejected: boolean;
  city: string;
  country: string;
}

// CANDIDATE-GROUP-V1: the "expand a job's candidate group" view -- shows
// ONLY that job's Hired/Rejected applicants (both are terminal statuses;
// anyone still Pending/Under Review/Shortlisted belongs to the live
// pipeline in the standalone Applicants section, not here) as avatar
// cards with a working CV download. Read-only by design -- status
// changes happen from the standalone Applicants section's Change Status
// action, not from here.
@Component({
  selector: 'app-candidate-group-detail',
  templateUrl: './candidate-group-detail.component.html',
  styleUrls: ['./candidate-group-detail.component.scss'],
  animations: [mainAnimations],
})
export class CandidateGroupDetailComponent implements OnInit {
  loading = true;
  jobId: string;
  jobTitle = '';
  applicants: GroupApplicant[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jobService: JobService,
    private snackbarService: SnackbarService,
  ) {}

  ngOnInit(): void {
    this.jobId = this.route.snapshot.paramMap.get('id');
    if (!this.jobId) {
      this.loading = false;
      return;
    }
    this.jobService.getJobApplicantsByJobId(this.jobId).subscribe({
      next: (res: any) => {
        // BUGFIX: filtered on hardcoded status ids (5/6) from the seed
        // migration's assumed Rejected/Hired mapping. Confirmed via live
        // data this doesn't match production (an applicant with
        // application_status_id=6 has jobApplicationStatusName "Rejected",
        // not "Hired") -- match on the NAME the backend already joined
        // live from job_applicant_status instead, correct regardless of
        // the real numbering.
        const all = (res?.data || []) as any[];
        this.applicants = all
          .filter((a) => a.jobApplicationStatusName === 'Hired' || a.jobApplicationStatusName === 'Rejected')
          .map((a) => ({
            userId: a.userId,
            applicationId: a.applicationId,
            fullName: `${a.firstName || ''} ${a.lastName || ''}`.trim() || 'Applicant',
            photoUrl: a.photoUrl,
            jobApplicationStatusId: a.jobApplicationStatusId,
            jobApplicationStatusName: a.jobApplicationStatusName,
            isHired: a.jobApplicationStatusName === 'Hired',
            isRejected: a.jobApplicationStatusName === 'Rejected',
            city: a.city,
            country: a.country,
          }));
        this.jobTitle = all[0]?.jobTitle || '';
        this.loading = false;
      },
      error: () => {
        this.applicants = [];
        this.loading = false;
        this.snackbarService.error("We couldn't load this candidate group right now. Please try again.", '');
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/recruiter/contacts/job-groups']);
  }

  onAvatarError(event: Event): void {
    (event.target as HTMLImageElement).src = '/assets/images/placeholder/job-post-banner-person.png';
  }

  // BUGFIX: this used to fetch-then-open the resume directly in a modal
  // (FileViewerComponent), bypassing the full applicant record entirely.
  // Now navigates to the dedicated Applicant Details page, which is the
  // only place in the employer/recruiter panel that shows an applicant's
  // documents (Resume/Cover Letter/Government Files, each downloadable).
  viewDetails(applicant: GroupApplicant): void {
    if (!applicant?.userId) {
      return;
    }
    this.router.navigate(['/recruiter/jobs/applicants/candidate', applicant.userId], {
      queryParams: { jobId: this.jobId },
    });
  }
}
