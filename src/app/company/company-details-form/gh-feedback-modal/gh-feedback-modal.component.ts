import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export type FeedbackState =
  | 'success'
  | 'error'
  | 'validation'
  | 'network'
  | 'partial'
  | 'conflict'
  | 'permission'
  | 'session';

export interface FieldError {
  field: string;
  message: string;
}

export interface FeedbackModalData {
  state: FeedbackState;
  title: string;
  body: string;
  syncNote?: string;
  changedFields?: string[];
  fieldErrors?: FieldError[];
  primaryCta: string;
  secondaryCta?: string;
  autoDismissMs?: number;
  requestId?: string;
}

@Component({
  selector: 'app-gh-feedback-modal',
  templateUrl: './gh-feedback-modal.component.html',
  styleUrls: ['./gh-feedback-modal.component.scss'],
})
export class GhFeedbackModalComponent implements OnInit, OnDestroy {
  private timer: any;

  constructor(
    public dialogRef: MatDialogRef<GhFeedbackModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: FeedbackModalData
  ) {}

  ngOnInit(): void {
    if (this.data.autoDismissMs && this.data.autoDismissMs > 0) {
      this.timer = setTimeout(() => this.close('auto'), this.data.autoDismissMs);
    }
  }

  close(action: string = 'primary'): void {
    this.dialogRef.close(action);
  }

  secondary(): void {
    this.dialogRef.close('secondary');
  }

  ngOnDestroy(): void {
    if (this.timer) { clearTimeout(this.timer); }
  }
}
