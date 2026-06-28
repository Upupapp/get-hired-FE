import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

// data can be either:
//   string          → backward-compat simple message + Close button
//   { message: string, actions: Array<{ label, value, primary? }> }
//                   → message + custom action buttons (each closes dialog with its value)

@Component({
  selector: 'app-updated-dialog',
  templateUrl: './updated-dialog.component.html',
  styleUrls: ['./updated-dialog.component.scss'],
})
export class UpdatedDialogComponent implements OnInit {
  message: string;
  actions: Array<{ label: string; value: string; primary?: boolean }> | null = null;

  constructor(
    public dialogRef: MatDialogRef<UpdatedDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data
  ) {
    if (data && typeof data === 'object' && data.message) {
      this.message = data.message;
      this.actions = data.actions || null;
    } else {
      this.message = data;
    }
  }

  ngOnInit(): void {}

  closeDialog() {
    this.dialogRef.close();
  }

  doAction(value: string) {
    this.dialogRef.close(value);
  }
}
