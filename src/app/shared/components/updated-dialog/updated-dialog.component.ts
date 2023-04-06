import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-updated-dialog',
  templateUrl: './updated-dialog.component.html',
  styleUrls: ['./updated-dialog.component.scss'],
})
export class UpdatedDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<UpdatedDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data
  ) {}

  ngOnInit(): void {}

  closeDialog() {
    this.dialogRef.close();
  }
}
