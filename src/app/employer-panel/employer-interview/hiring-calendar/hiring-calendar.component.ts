import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { InterviewSchedulingService } from '@app-shared/interview-scheduling/interview-scheduling.service';
import { ScheduledInterview } from '@app-shared/interview-scheduling/interview-scheduling.models';
import { detectBrowserTimeZone } from '@app-shared/interview-scheduling/interview-timezone.utils';
import {
  bucketInterviewsByDay,
  CalendarEventItem,
  CalendarViewMode,
  formatRangeHeading,
  shiftAnchor,
} from '@app-shared/interview-scheduling/calendar.utils';
import { ScheduleInterviewDialogComponent, ScheduleInterviewDialogData } from '@app-shared/components/schedule-interview-dialog/schedule-interview-dialog.component';
import { SelectJobApplicantDialogComponent, SelectJobApplicantDialogResult } from '@app-shared/components/select-job-applicant-dialog/select-job-applicant-dialog.component';
import { SnackbarService } from '@app-core/services/snackbar.service';

type StatusFilter = 'all' | 'scheduled' | 'cancelled';

/**
 * Phase 1.5B -- Hiring Calendar. Presentation layer only, over the exact
 * same authorized `GET /interview/scheduled` data the existing List view
 * already uses -- no second data model, no new backend route. Fetches once
 * (backend already caps at 200 rows, most-recent-first -- a reasonable
 * dataset for client-side grouping per this phase's explicit guidance) and
 * re-buckets by day locally on every navigation, rather than one API call
 * per visible range.
 */
@Component({
  selector: 'app-hiring-calendar',
  templateUrl: './hiring-calendar.component.html',
  styleUrls: ['./hiring-calendar.component.scss'],
})
export class HiringCalendarComponent implements OnInit, OnDestroy {
  viewMode: CalendarViewMode = 'week';
  anchorDate: Date = new Date();
  readonly displayTimeZone = detectBrowserTimeZone();

  loading = true;
  error = false;
  interviews: ScheduledInterview[] = [];
  bucketedByDay = new Map<string, CalendarEventItem[]>();

  statusFilter: StatusFilter = 'all';
  jobFilter: string | 'all' = 'all';

  private sub: Subscription | null = null;

  constructor(
    private interviewService: InterviewSchedulingService,
    private router: Router,
    private dialog: MatDialog,
    private snackbarService: SnackbarService,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading = true;
    this.error = false;
    if (this.sub) { this.sub.unsubscribe(); }
    // No filter param -> every lifecycle state, most-recent 200 first
    // (see backend listForEmployer's LIMIT 200 ORDER BY start_at DESC).
    this.sub = this.interviewService.list().subscribe({
      next: (res) => {
        this.interviews = res.items || [];
        this.recompute();
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

  private recompute(): void {
    const filtered = this.interviews.filter((iv) => {
      if (this.statusFilter === 'scheduled' && iv.lifecycleState !== 'scheduled') { return false; }
      if (this.statusFilter === 'cancelled' && iv.lifecycleState !== 'cancelled') { return false; }
      if (this.jobFilter !== 'all' && iv.jobId !== this.jobFilter) { return false; }
      return true;
    });
    this.bucketedByDay = bucketInterviewsByDay(filtered, this.displayTimeZone);
  }

  /** Distinct jobs present in the fetched (already-authorized) dataset -- not a second job-list API call. */
  get jobOptions(): { jobId: string; jobTitle: string }[] {
    const seen = new Map<string, string>();
    for (const iv of this.interviews) {
      if (!seen.has(iv.jobId)) { seen.set(iv.jobId, iv.jobTitle); }
    }
    return Array.from(seen.entries()).map(([jobId, jobTitle]) => ({ jobId, jobTitle }));
  }

  onStatusFilterChange(value: StatusFilter): void {
    this.statusFilter = value;
    this.recompute();
  }

  onJobFilterChange(value: string): void {
    this.jobFilter = value;
    this.recompute();
  }

  get rangeHeading(): string {
    return formatRangeHeading(this.viewMode, this.anchorDate);
  }

  setView(mode: CalendarViewMode): void {
    this.viewMode = mode;
  }

  goPrev(): void {
    this.anchorDate = shiftAnchor(this.viewMode, this.anchorDate, 'prev');
  }

  goNext(): void {
    this.anchorDate = shiftAnchor(this.viewMode, this.anchorDate, 'next');
  }

  goToday(): void {
    this.anchorDate = new Date();
  }

  /** Month view "select a date" -> switch to Day view for that date (simplest maintainable interaction, per spec). */
  onDateSelected(date: Date): void {
    this.anchorDate = date;
    this.viewMode = 'day';
  }

  viewInterview(interview: ScheduledInterview): void {
    this.router.navigate(['/recruiter/interview/scheduled', interview.interviewId]);
  }

  goToList(): void {
    this.router.navigate(['/recruiter/interview/scheduled']);
  }

  /** Identical picker -> schedule-dialog chain as scheduled-interviews-list.component.ts's newInterview(). */
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

  ngOnDestroy(): void {
    if (this.sub) { this.sub.unsubscribe(); }
  }
}
