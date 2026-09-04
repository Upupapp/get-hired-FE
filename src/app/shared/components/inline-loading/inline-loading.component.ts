import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-inline-loading',
  templateUrl: './inline-loading.component.html',
  styleUrls: ['./inline-loading.component.scss']
})
export class InlineLoadingComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<InlineLoadingComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
  ) {
    // OVERLAY-AUDIT FIX: see loading.component.ts's identical constructor
    // comment -- same rationale, same escape hatch, same guard (this
    // component is even more commonly used as a bare embedded element
    // outside any MatDialog than LoadingComponent is).
    if (this.dialogRef && typeof this.dialogRef.addPanelClass === 'function') {
      this.dialogRef.addPanelClass('gh-loading-panel');
    }
  }

  ngOnInit(): void {
    if(this.data.selfClose) {
      // OVERLAY-AUDIT FIX: see loading.component.ts -- identical comma-
      // expression bug, same fix, currently dormant the same way.
      setTimeout(() => this.dialogRef.close(), 3000);
    }

  }

}
