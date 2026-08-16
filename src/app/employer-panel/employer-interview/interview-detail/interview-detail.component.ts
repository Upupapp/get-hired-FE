import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { InterviewSchedulingService } from '@app-shared/interview-scheduling/interview-scheduling.service';
import { CUSTOM_INTERVIEW_TYPE, ScheduledInterview } from '@app-shared/interview-scheduling/interview-scheduling.models';
import { detectBrowserTimeZone, formatInTimeZone } from '@app-shared/interview-scheduling/interview-timezone.utils';
import { ScheduleInterviewDialogComponent, ScheduleInterviewDialogData } from '@app-shared/components/schedule-interview-dialog/schedule-interview-dialog.component';
import { CancelInterviewDialogComponent, CancelInterviewDialogData } from '@app-shared/components/cancel-interview-dialog/cancel-interview-dialog.component';
import { SnackbarService } from '@app-core/services/snackbar.service';

const FORMAT_LABELS: Record<string, string> = {
  video_call: 'Video Call',
  phone: 'Phone',
  in_person: 'In Person',
  custom: 'Custom',
};

const NOTIFICATION_LABELS: Record<string, string> = {
  pending: 'Pending',
  sent: 'Sent',
  failed: 'Failed',
  not_configured: 'Not configured',
};

/**
 * Internal Interview Scheduling MVP -- full detail view for one scheduled
 * interview. The API doesn't expose reschedule history beyond a count, so
 * this only ever shows `rescheduleCount` as a small note -- no fabricated
 * audit timeline.
 */
@Component({
  selector: 'app-interview-detail',
  templateUrl: './interview-detail.component.html',
  styleUrls: ['./interview-detail.component.scss'],
})
export class InterviewDetailComponent implements OnInit, OnDestroy {
  interview: ScheduledInterview | null = null;
  loading = true;
  notFound = false;
  readonly browserTimeZone = detectBrowserTimeZone();
  readonly customTypeValue = CUSTOM_INTERVIEW_TYPE;

  private sub: Subscription | null = null;
  private interviewId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private interviewService: InterviewSchedulingService,
    private dialog: MatDialog,
    private snackbarService: SnackbarService
  ) {}

  ngOnInit(): void {
    this.interviewId = this.route.snapshot.paramMap.get('interviewId');
    this.load();
  }

  private load(): void {
    if (!this.interviewId) {
      this.notFound = true;
      this.loading = false;
      return;
    }
    this.loading = true;
    this.notFound = false;
    this.sub = this.interviewService.getById(this.interviewId).subscribe({
      next: (interview) => {
        this.interview = interview;
        this.loading = false;
      },
      // Per the API contract, 403 covers both "not found" and "not
      // authorized" -- shown identically as a generic not-found state.
      error: () => {
        this.notFound = true;
        this.loading = false;
      },
    });
  }

  get typeLabel(): string {
    if (!this.interview) { return ''; }
    return this.interview.interviewType === this.customTypeValue && this.interview.customTypeLabel
      ? this.interview.customTypeLabel
      : this.interview.interviewType;
  }

  get formatLabel(): string {
    if (!this.interview) { return ''; }
    return FORMAT_LABELS[this.interview.format] || this.interview.format;
  }

  get notificationLabel(): string {
    if (!this.interview) { return ''; }
    return NOTIFICATION_LABELS[this.interview.notificationState] || this.interview.notificationState;
  }

  get scheduledTimeLabel(): string {
    if (!this.interview) { return ''; }
    return `${formatInTimeZone(this.interview.startAt, this.interview.timezone)} (${this.interview.timezone})`;
  }

  get browserTimeLabel(): string | null {
    if (!this.interview || this.browserTimeZone === this.interview.timezone) { return null; }
    return `Your time: ${formatInTimeZone(this.interview.startAt, this.browserTimeZone)} (${this.browserTimeZone})`;
  }

  get canReschedule(): boolean {
    return !!this.interview && this.interview.displayStatus === 'scheduled';
  }

  get canCancel(): boolean {
    return !!this.interview && this.interview.displayStatus === 'scheduled';
  }

  get applicantName(): string {
    return (this.interview?.applicant && (this.interview.applicant.name || this.interview.applicant.email)) || 'Applicant';
  }

  goBack(): void {
    this.router.navigate(['/recruiter/interview/scheduled']);
  }

  /**
   * Phase 1.5A -- "Message Applicant" linkage. Deep-links into the existing
   * recruiter inbox with this interview's (jobId, applicantUid); the inbox
   * reuses MessageService.openThread(), which is idempotent server-side, so
   * repeat clicks never create duplicate threads.
   */
  messageApplicant(): void {
    if (!this.interview) { return; }
    this.router.navigate(['/recruiter/messages'], {
      queryParams: { jobId: this.interview.jobId, applicantUid: this.interview.applicant.uid },
    });
  }

  reschedule(): void {
    if (!this.interview) { return; }
    const data: ScheduleInterviewDialogData = { mode: 'reschedule', interview: this.interview };
    const ref = this.dialog.open(ScheduleInterviewDialogComponent, {
      width: 'min(560px, 95vw)',
      maxHeight: '92vh',
      autoFocus: true,
      restoreFocus: true,
      data,
    });
    ref.afterClosed().subscribe((res) => {
      if (res && res.interview) {
        this.snackbarService.success('Interview rescheduled.', 'OK', 3000);
        this.load();
      }
    });
  }

  cancel(): void {
    if (!this.interview) { return; }
    const data: CancelInterviewDialogData = { interview: this.interview, applicantName: this.applicantName };
    const ref = this.dialog.open(CancelInterviewDialogComponent, {
      width: 'min(440px, 95vw)',
      autoFocus: true,
      restoreFocus: true,
      data,
    });
    ref.afterClosed().subscribe((res) => {
      if (res && res.interview) {
        this.snackbarService.success('Interview cancelled.', 'OK', 3000);
        this.load();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.sub) { this.sub.unsubscribe(); }
  }
}
