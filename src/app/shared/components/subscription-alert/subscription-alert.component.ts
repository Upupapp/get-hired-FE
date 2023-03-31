import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-subscription-alert',
  templateUrl: './subscription-alert.component.html',
  styleUrls: ['./subscription-alert.component.scss']
})
export class SubscriptionAlertComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    public dialogRef: MatDialogRef<SubscriptionAlertComponent>,

  ) { }

  ngOnInit(): void {
  }

  close() {
    this.dialogRef.close()
  }
}
