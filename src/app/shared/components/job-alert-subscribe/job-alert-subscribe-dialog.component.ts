import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import {
  JobOpeningAlertsService,
  jobOpeningAlertErrorMessage,
} from '@main/jobs/job-opening-alerts.service';

/**
 * Free-text position subscribe dialog opened from the public jobs hero.
 * MatDialog supplies the focus trap, Escape, and backdrop dismiss.
 */
@Component({
  selector: 'app-job-alert-subscribe-dialog',
  templateUrl: './job-alert-subscribe-dialog.component.html',
  styleUrls: ['./job-alert-subscribe-dialog.component.scss'],
})
export class JobAlertSubscribeDialogComponent implements OnDestroy {
  @ViewChild('successStatus') successStatus?: ElementRef<HTMLElement>;

  position = new FormControl('', [Validators.required, Validators.maxLength(120)]);
  submitting = false;
  succeeded = false;
  alreadySubscribed = false;
  subscribedPosition = '';
  formError: string | null = null;

  private createSub: Subscription | null = null;

  constructor(
    private dialogRef: MatDialogRef<JobAlertSubscribeDialogComponent>,
    private alerts: JobOpeningAlertsService,
  ) {}

  get title(): string {
    if (!this.succeeded) return 'Get job alerts';
    return this.alreadySubscribed ? 'You\'re already getting alerts' : 'You\'ll be notified';
  }

  get description(): string {
    if (!this.succeeded) {
      return 'Enter the position you want to hear about. We email matching openings when you subscribe, then once a week.';
    }
    if (this.alreadySubscribed) {
      return `You're already getting alerts for "${this.subscribedPosition}".`;
    }
    return `You'll be notified when new openings match "${this.subscribedPosition}".`;
  }

  ngOnDestroy(): void {
    if (this.createSub) this.createSub.unsubscribe();
  }

  submit(event?: Event): void {
    if (event && typeof event.preventDefault === 'function') event.preventDefault();
    this.formError = null;
    const value = (this.position.value || '').trim();
    if (!value) {
      this.position.markAsTouched();
      this.formError = 'Enter a position to follow.';
      return;
    }
    if (value.length > 120) {
      this.position.markAsTouched();
      this.formError = 'Use 120 characters or fewer.';
      return;
    }
    if (this.submitting || this.succeeded) return;

    this.submitting = true;
    this.dialogRef.disableClose = true;
    this.createSub = this.alerts.create(value).subscribe({
      next: (result) => {
        this.submitting = false;
        this.dialogRef.disableClose = false;
        this.subscribedPosition = value;
        this.alreadySubscribed = !result.created;
        this.succeeded = true;
        setTimeout(() => {
          if (this.successStatus) this.successStatus.nativeElement.focus();
        });
      },
      error: (err) => {
        this.submitting = false;
        this.dialogRef.disableClose = false;
        this.formError = jobOpeningAlertErrorMessage(err);
      },
    });
  }

  close(): void {
    if (this.submitting) return;
    this.dialogRef.close(this.succeeded);
  }
}

export function openJobAlertSubscribeDialog(
  dialog: MatDialog,
): MatDialogRef<JobAlertSubscribeDialogComponent> {
  return dialog.open(JobAlertSubscribeDialogComponent, {
    panelClass: 'gh-job-alert-modal',
    width: '440px',
    maxWidth: 'calc(100vw - 32px)',
    autoFocus: 'first-tabbable',
    restoreFocus: true,
    role: 'dialog',
    ariaLabelledBy: 'job-alert-modal-title',
    ariaDescribedBy: 'job-alert-modal-description',
    closeOnNavigation: true,
  });
}
