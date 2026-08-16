import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { JobService } from '@app-job/job.service';

/**
 * Phase 1.5A — "New Interview" entry point. Standalone job + applicant
 * picker that hands off to the existing ScheduleInterviewDialogComponent
 * (mode: 'create') once both are selected -- this dialog never talks to the
 * scheduling create route itself, and never duplicates schedule-form logic.
 *
 * Reuses existing, already job-scope-authorized endpoints:
 *   - JobService.getJobBasicList()        -> GET /job/basiclist
 *   - JobService.getJobApplicantsByJobId() -> GET /job/applicants?id=
 * Both already derive company/job-scope from the caller's JWT server-side
 * (confirmed in job.service.ts's own P2-01 comments) -- this dialog never
 * sends a company/job id the backend would trust blindly.
 */
export interface SelectJobApplicantDialogResult {
  jobId: string;
  jobTitle: string;
  applicationId: string;
  applicantName?: string;
}

interface JobOption {
  jobId: string;
  jobTitle: string;
}

interface ApplicantOption {
  applicationId: string;
  name: string;
}

@Component({
  selector: 'app-select-job-applicant-dialog',
  templateUrl: './select-job-applicant-dialog.component.html',
  styleUrls: ['./select-job-applicant-dialog.component.scss'],
})
export class SelectJobApplicantDialogComponent implements OnInit {
  step: 'job' | 'applicant' = 'job';

  jobs: JobOption[] = [];
  jobsLoading = true;
  jobsError = false;

  selectedJob: JobOption | null = null;

  applicants: ApplicantOption[] = [];
  applicantsLoading = false;
  applicantsError = false;

  selectedApplicant: ApplicantOption | null = null;

  constructor(
    public dialogRef: MatDialogRef<SelectJobApplicantDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: unknown,
    private jobService: JobService,
  ) {}

  ngOnInit(): void {
    this.loadJobs();
  }

  private loadJobs(): void {
    this.jobsLoading = true;
    this.jobsError = false;
    this.jobService.getJobBasicList().subscribe({
      next: (res: any) => {
        const list = (res && res.data) || res || [];
        this.jobs = (Array.isArray(list) ? list : []).map((j: any) => ({
          jobId: j.jobId,
          jobTitle: j.jobTitle,
        }));
        this.jobsLoading = false;
      },
      error: () => {
        this.jobsError = true;
        this.jobsLoading = false;
      },
    });
  }

  retryJobs(): void {
    this.loadJobs();
  }

  selectJob(job: JobOption): void {
    this.selectedJob = job;
    this.step = 'applicant';
    this.loadApplicants(job.jobId);
  }

  backToJobs(): void {
    this.step = 'job';
    this.selectedApplicant = null;
  }

  private loadApplicants(jobId: string): void {
    this.applicantsLoading = true;
    this.applicantsError = false;
    this.applicants = [];
    this.jobService.getJobApplicantsByJobId(jobId).subscribe({
      next: (res: any) => {
        const list = (res && res.data) || res || [];
        this.applicants = (Array.isArray(list) ? list : [])
          // applicationId is returned by the backend today but not yet
          // declared on the strict JobApplicants model (confirmed via
          // job-applicants.component.ts's own `(applicant as any).applicationId`
          // workaround) -- accessed the same defensive way here rather than
          // widening a shared model as an unrelated change.
          .filter((a: any) => !!a.applicationId)
          .map((a: any) => ({
            applicationId: a.applicationId,
            name: [a.firstName, a.lastName].filter(Boolean).join(' ') || a.email || 'Applicant',
          }));
        this.applicantsLoading = false;
      },
      error: () => {
        this.applicantsError = true;
        this.applicantsLoading = false;
      },
    });
  }

  retryApplicants(): void {
    if (this.selectedJob) { this.loadApplicants(this.selectedJob.jobId); }
  }

  continue(applicant: ApplicantOption): void {
    if (!this.selectedJob) { return; }
    const result: SelectJobApplicantDialogResult = {
      jobId: this.selectedJob.jobId,
      jobTitle: this.selectedJob.jobTitle,
      applicationId: applicant.applicationId,
      applicantName: applicant.name,
    };
    this.dialogRef.close(result);
  }

  close(): void {
    this.dialogRef.close(null);
  }
}
