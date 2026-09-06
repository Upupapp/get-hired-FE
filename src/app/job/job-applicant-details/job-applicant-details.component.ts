import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location, DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { Subject, catchError, map, of, takeUntil } from 'rxjs';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { JobService } from '@app-job/job.service';
import { SnackbarService } from '@app-core/services/snackbar.service';
import { ApplicantActionModalComponent } from '../job-applicants/applicant-action-modal/applicant-action-modal.component';

// CANDIDATE-GROUP-V2: dedicated, URL-addressable Applicant Details page --
// replaces the old showProfile-toggle inline panel that lived inside
// job-applicants.component.html (same URL as the list, no back-button
// support, no way to share/bookmark a specific applicant). This is the
// ONLY place in the employer/recruiter panel that shows an applicant's
// documents (Resume/Cover Letter/Government Files) with download --
// every other "View CV" entry point (job-applicants list's CV column,
// Candidate Group's card button) now navigates here instead of opening
// a document preview modal directly.
@Component({
  selector: 'app-job-applicant-details',
  templateUrl: './job-applicant-details.component.html',
  styleUrls: ['./job-applicant-details.component.scss'],
  animations: [mainAnimations],
})
export class JobApplicantDetailsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  loading = true;
  loadError = false;
  jobId: string;
  userId: string;

  profile: any = null;
  interviewQuestions: any[] = [];
  applicantAnswers: any[] = [];
  profileDocs: any = null;
  matchSignals: any = null;

  // BUGFIX: GET /job/applicantdetails' `profile` (from applicant.service.js's
  // appplicantProfile()) is the CANDIDATE's own profile row -- it has no
  // application_status_id, applicationId, dateApplied, or jobTitle at all
  // (those only exist on the job_applicants-joined LIST endpoint,
  // mappedBasicApplicantDetails()). Without this, the header always
  // showed "Unknown" status and no applied date, and Change Status had
  // no applicationId to submit at all. Fetches the same list endpoint
  // job-applicants.component.ts already uses and finds this one row by
  // userId -- header display and Change Status both read from THIS,
  // never from `profile`.
  applicantRow: any = null;

  snapshotSummary: any = null;
  snapshotSummaryLoading = false;

  showMessageThread = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private dialog: MatDialog,
    private jobService: JobService,
    private snackbarService: SnackbarService,
    private datePipe: DatePipe,
  ) {}

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('userId');
    this.jobId = this.route.snapshot.queryParamMap.get('jobId');
    if (!this.userId || !this.jobId) {
      this.loading = false;
      this.loadError = true;
      return;
    }
    this.loadApplicant();
    this.loadApplicantRow();
    this.loadMatchSignal();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadApplicant(): void {
    this.loading = true;
    this.loadError = false;
    this.jobService.getJobApplicantDetails(this.jobId, this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          const data = res?.data;
          if (!data || !data.profile) {
            this.loading = false;
            this.loadError = true;
            return;
          }
          this.profile = data.profile;
          this.interviewQuestions = data.interviewQuestions || [];
          this.applicantAnswers = data.answers || [];
          this.profileDocs = data.profileDocs || null;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.loadError = true;
        },
      });
  }

  private loadApplicantRow(): void {
    this.jobService.getJobApplicantsByJobId(this.jobId)
      .pipe(
        map((res: any) => (res?.data || []) as any[]),
        catchError(() => of([])),
        takeUntil(this.destroy$),
      )
      .subscribe((rows) => {
        this.applicantRow = rows.find((r) => r?.userId === this.userId) || null;
        if (this.applicantRow?.applicationId) {
          this.loadSnapshotSummary(this.applicantRow.applicationId);
        }
      });
  }

  // Additive -- best-effort, never blocks the rest of the page if it
  // fails or the applicant simply has no signal (same fallback rule as
  // job-applicants.component.ts's own loadMatchSignals()).
  private loadMatchSignal(): void {
    this.jobService.getJobApplicantSignals(this.jobId)
      .pipe(
        map((res: any) => (res?.data || []) as any[]),
        catchError(() => of([])),
        takeUntil(this.destroy$),
      )
      .subscribe((list) => {
        const match = list.find((a) => a?.userId === this.userId);
        this.matchSignals = match ? match.fitSignals : null;
      });
  }

  private loadSnapshotSummary(applicationId: string): void {
    this.snapshotSummary = null;
    this.snapshotSummaryLoading = true;
    this.jobService.getApplicantSnapshotSummary(applicationId)
      .pipe(
        map((res: any) => res?.data),
        catchError(() => of(null)),
        takeUntil(this.destroy$),
      )
      .subscribe((data) => {
        this.snapshotSummary = data;
        this.snapshotSummaryLoading = false;
      });
  }

  get fullName(): string {
    if (!this.profile) { return ''; }
    return `${this.profile.firstName || ''} ${this.profile.lastName || ''}`.trim() || 'Applicant';
  }

  get appliedDateLabel(): string {
    if (!this.applicantRow?.dateApplied) { return ''; }
    return this.datePipe.transform(this.applicantRow.dateApplied, 'mediumDate') || '';
  }

  onAvatarError(event: Event): void {
    (event.target as HTMLImageElement).src = '/assets/images/placeholder/job-post-banner-person.png';
  }

  goBack(): void {
    this.location.back();
  }

  toggleMessageThread(): void {
    this.showMessageThread = !this.showMessageThread;
  }

  openChangeStatus(): void {
    if (!this.applicantRow?.applicationId) { return; }
    const dialogRef = this.dialog.open(ApplicantActionModalComponent, {
      width: 'min(560px, 95vw)',
      data: {
        job_id: this.jobId,
        data: this.applicantRow,
        openToStatus: true,
      },
    });
    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((result) => {
      if (result?.statusUpdated) {
        this.applicantRow = {
          ...this.applicantRow,
          jobApplicationStatusId: result.newStatusId,
          jobApplicationStatusName: result.newStatusName,
        };
      }
    });
  }
}
