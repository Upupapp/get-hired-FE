import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-subscription-summary',
  templateUrl: './subscription-summary.component.html',
  styleUrls: ['./subscription-summary.component.scss']
})
export class SubscriptionSummaryComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<SubscriptionSummaryComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
  ) { }

  ngOnInit(): void {
  }

  submit(answer) {
    this.dialogRef.close(answer);
  }

}
