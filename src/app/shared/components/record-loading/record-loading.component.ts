import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-record-loading',
  templateUrl: './record-loading.component.html',
  styleUrls: ['./record-loading.component.scss']
})
export class RecordLoadingComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<RecordLoadingComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
  ) {
    // OVERLAY-AUDIT FIX: see loading.component.ts's identical constructor
    // comment -- same rationale, same escape hatch, same guard. (This
    // component's own setTimeout below was already correct -- no timer
    // bug here.)
    if (this.dialogRef && typeof this.dialogRef.addPanelClass === 'function') {
      this.dialogRef.addPanelClass('gh-loading-panel');
    }
  }

  ngOnInit(): void {
    if(this.data.selfClose) {
      setTimeout(() => this.dialogRef.close(), 5000);
    }

  }

}
