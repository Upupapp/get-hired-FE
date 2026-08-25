import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

export type JobPostMode = 'comprehensive' | 'simplified';

/**
 * "Start From Scratch" mode picker -- opened from
 * EasyJobPostAssistantModalComponent.chooseManual() before navigating to
 * /recruiter/jobs/create. Lets the Employer choose between the full
 * (Comprehensive) job-create form and a trimmed-down (Simplified) view of
 * the SAME form/page that only shows fields required (or high-value) to
 * publish -- see job-create.component.ts's `postMode`/`isSimplified`.
 *
 * Closes with a JobPostMode string on an explicit choice, or `undefined`
 * on backdrop click / Escape -- the caller must not navigate in that case.
 */
@Component({
  selector: 'app-job-post-mode-dialog',
  templateUrl: './job-post-mode-dialog.component.html',
  styleUrls: ['./job-post-mode-dialog.component.scss'],
})
export class JobPostModeDialogComponent {
  constructor(private dialogRef: MatDialogRef<JobPostModeDialogComponent, JobPostMode>) {}

  choose(mode: JobPostMode): void {
    this.dialogRef.close(mode);
  }

  close(): void {
    this.dialogRef.close(undefined);
  }
}
