import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { InterviewSchedulingService } from '@app-shared/interview-scheduling/interview-scheduling.service';
import {
  CUSTOM_INTERVIEW_TYPE,
  InterviewListFilter,
  ScheduledInterview,
} from '@app-shared/interview-scheduling/interview-scheduling.models';
import { detectBrowserTimeZone, formatInTimeZone } from '@app-shared/interview-scheduling/interview-timezone.utils';
import { ScheduleInterviewDialogComponent, ScheduleInterviewDialogData } from '@app-shared/components/schedule-interview-dialog/schedule-interview-dialog.component';
import { CancelInterviewDialogComponent, CancelInterviewDialogData } from '@app-shared/components/cancel-interview-dialog/cancel-interview-dialog.component';
import { SelectJobApplicantDialogComponent, SelectJobApplicantDialogResult } from '@app-shared/components/select-job-applicant-dialog/select-job-applicant-dialog.component';
import { SnackbarService } from '@app-core/services/snackbar.service';

type FilterTab = 'all' | InterviewListFilter;

interface FilterTabOption {
  key: FilterTab;
  label: string;
}

const FORMAT_LABELS: Record<string, string> = {
  video_call: 'Video Call',
  phone: 'Phone',
  in_person: 'In Person',
  custom: 'Custom',
};

const NOTIFICATION_LABELS: Record<string, string> = {
  pending: 'Notification pending',
  sent: 'Applicant notified',
  failed: 'Notification failed',
  not_configured: 'Notifications not configured',
};

/**
 * Internal Interview Scheduling MVP -- "Scheduled Interviews" tab of the
 * Interviews area. Card list (not a calendar grid, per the MVP's explicit
 * scope) with Upcoming/Past/Cancelled filters mapped straight to the
 * backend's `filter` query param -- no client-side date math.
 */
@Component({
  selector: 'app-scheduled-interviews-list',
  templateUrl: './scheduled-interviews-list.component.html',
  styleUrls: ['./scheduled-interviews-list.component.scss'],
})
export class ScheduledInterviewsListComponent implements OnInit, OnDestroy {
  items: ScheduledInterview[] = [];
  loading = true;
  error = false;
  activeFilter: FilterTab = 'upcoming';
  readonly browserTimeZone = detectBrowserTimeZone();

  readonly filters: FilterTabOption[] = [
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'past', label: 'Past' },
    { key: 'cancelled', label: 'Cancelled' },
    { key: 'all', label: 'All' },
  ];

  private sub: Subscription | null = null;

  constructor(
    private interviewService: InterviewSchedulingService,
    private dialog: MatDialog,
    private router: Router,
    private snackbarService: SnackbarService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = false;
    if (this.sub) { this.sub.unsubscribe(); }
    const filterParam = this.activeFilter === 'all' ? undefined : this.activeFilter;
    this.sub = this.interviewService.list(filterParam).subscribe({
      next: (res) => {
        this.items = res.items || [];
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      },
    });
  }

  retry(): void {
    this.load();
  }

  setFilter(key: FilterTab): void {
    if (this.activeFilter === key) { return; }
    this.activeFilter = key;
    this.load();
  }

  displayName(interview: ScheduledInterview): string {
    return (interview.applicant && (interview.applicant.name || interview.applicant.email)) || 'Applicant';
  }

  typeLabel(interview: ScheduledInterview): string {
    return interview.interviewType === CUSTOM_INTERVIEW_TYPE && interview.customTypeLabel
      ? interview.customTypeLabel
      : interview.interviewType;
  }

  formatLabel(interview: ScheduledInterview): string {
    return FORMAT_LABELS[interview.format] || interview.format;
  }

  notificationLabel(interview: ScheduledInterview): string {
    return NOTIFICATION_LABELS[interview.notificationState] || interview.notificationState;
  }

  scheduledTimeLabel(interview: ScheduledInterview): string {
    return `${formatInTimeZone(interview.startAt, interview.timezone)} (${interview.timezone})`;
  }

  /** Shown only when the viewing employer's browser timezone differs from
   * the interview's own stored timezone, per the "never show a bare time"
   * clarity bar. */
  browserTimeLabel(interview: ScheduledInterview): string | null {
    if (this.browserTimeZone === interview.timezone) { return null; }
    return `Your time: ${formatInTimeZone(interview.startAt, this.browserTimeZone)} (${this.browserTimeZone})`;
  }

  canReschedule(interview: ScheduledInterview): boolean {
    return interview.displayStatus === 'scheduled';
  }

  canCancel(interview: ScheduledInterview): boolean {
    return interview.displayStatus === 'scheduled';
  }

  viewDetail(interview: ScheduledInterview): void {
    this.router.navigate(['/recruiter/interview/scheduled', interview.interviewId]);
  }

  /**
   * Phase 1.5A -- standalone "New Interview" entry point. Opens the job/
   * applicant picker first, then chains into the existing schedule dialog
   * (mode: 'create') on confirmation -- reuses the same create route and
   * form the job-applicants page already uses, no second scheduling flow.
   */
  newInterview(): void {
    const pickerRef = this.dialog.open(SelectJobApplicantDialogComponent, {
      width: 'min(440px, 95vw)',
      autoFocus: true,
      restoreFocus: true,
    });
    pickerRef.afterClosed().subscribe((picked: SelectJobApplicantDialogResult | null) => {
      if (!picked) { return; }
      const data: ScheduleInterviewDialogData = {
        mode: 'create',
        jobId: picked.jobId,
        applicationId: picked.applicationId,
        applicantName: picked.applicantName,
        jobTitle: picked.jobTitle,
      };
      const scheduleRef = this.dialog.open(ScheduleInterviewDialogComponent, {
        width: 'min(560px, 95vw)',
        maxHeight: '92vh',
        autoFocus: true,
        restoreFocus: true,
        data,
      });
      scheduleRef.afterClosed().subscribe((res) => {
        if (res && res.interview) {
          this.snackbarService.success('Interview scheduled.', 'OK', 3000);
          this.load();
        }
      });
    });
  }

  reschedule(interview: ScheduledInterview, event: Event): void {
    event.stopPropagation();
    const data: ScheduleInterviewDialogData = { mode: 'reschedule', interview };
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

  cancel(interview: ScheduledInterview, event: Event): void {
    event.stopPropagation();
    const data: CancelInterviewDialogData = { interview, applicantName: this.displayName(interview) };
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

  trackByInterviewId(_: number, item: ScheduledInterview): string {
    return item.interviewId;
  }

  ngOnDestroy(): void {
    if (this.sub) { this.sub.unsubscribe(); }
  }
}
