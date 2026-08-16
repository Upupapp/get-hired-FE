import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { InterviewSchedulingService } from '@app-shared/interview-scheduling/interview-scheduling.service';
import { ScheduledInterview } from '@app-shared/interview-scheduling/interview-scheduling.models';

export interface CancelInterviewDialogData {
  interview: ScheduledInterview;
  applicantName?: string;
}

export interface CancelInterviewDialogResult {
  interview: ScheduledInterview;
  notificationWarning: string | null;
}

@Component({
  selector: 'app-cancel-interview-dialog',
  templateUrl: './cancel-interview-dialog.component.html',
  styleUrls: ['./cancel-interview-dialog.component.scss'],
})
export class CancelInterviewDialogComponent {
  reason = '';
  submitting = false;
  serverErrorMessage: string | null = null;
  successResult: CancelInterviewDialogResult | null = null;

  constructor(
    public dialogRef: MatDialogRef<CancelInterviewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CancelInterviewDialogData,
    private interviewService: InterviewSchedulingService
  ) {}

  get applicantName(): string {
    return this.data.applicantName || this.data.interview?.applicant?.name || this.data.interview?.applicant?.email || 'this applicant';
  }

  confirmCancel(): void {
    if (this.submitting) { return; }
    this.submitting = true;
    this.serverErrorMessage = null;

    this.interviewService.cancel(this.data.interview.interviewId, { reason: this.reason?.trim() || undefined }).subscribe({
      next: (res) => {
        this.submitting = false;
        this.successResult = { interview: res.interview, notificationWarning: res.notificationWarning };
      },
      error: (err) => {
        this.submitting = false;
        const status = err?.status;
        if (status === 403) {
          this.serverErrorMessage = "You don't have permission to do that.";
          return;
        }
        this.serverErrorMessage = err?.error?.error || "We couldn't cancel this interview. Please try again.";
      },
    });
  }

  close(): void {
    this.dialogRef.close(null);
  }

  done(): void {
    this.dialogRef.close(this.successResult);
  }
}
