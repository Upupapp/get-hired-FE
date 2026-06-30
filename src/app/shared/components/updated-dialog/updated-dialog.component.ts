import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

// data can be:
//   string  → backward-compat simple message + Close button
//   { message, actions, callbacks?, linkUrl?, linkText? }
//     actions   — buttons; each calls doAction(value) which normally closes the dialog
//     callbacks — { [value]: () => void }; if a matching callback exists, doAction calls
//                 it WITHOUT closing the dialog (used for in-place actions like copy-link)
//     linkUrl   — optional external URL shown as a real <a> (popup-blocked fallback)
//     linkText  — display text for linkUrl

@Component({
  selector: 'app-updated-dialog',
  templateUrl: './updated-dialog.component.html',
  styleUrls: ['./updated-dialog.component.scss'],
})
export class UpdatedDialogComponent implements OnInit {
  message: string;
  actions: Array<{ label: string; value: string; primary?: boolean }> | null = null;
  callbacks: { [key: string]: () => void } | null = null;
  linkUrl: string | null = null;
  linkText: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<UpdatedDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data
  ) {
    if (data && typeof data === 'object' && data.message) {
      this.message = data.message;
      this.actions = data.actions || null;
      this.callbacks = data.callbacks || null;
      this.linkUrl = data.linkUrl || null;
      this.linkText = data.linkText || null;
    } else {
      this.message = data;
    }
  }

  ngOnInit(): void {}

  closeDialog() {
    this.dialogRef.close();
  }

  doAction(value: string) {
    // If a callback is registered, invoke it and keep the dialog open (e.g. copy-link)
    if (this.callbacks && this.callbacks[value]) {
      this.callbacks[value]();
      return;
    }
    this.dialogRef.close(value);
  }
}
