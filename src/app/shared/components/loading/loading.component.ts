import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<LoadingComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
  ) {
    // OVERLAY-AUDIT FIX: a loading/spinner state is transient, not a
    // decision the user needs to make -- it shouldn't inherit the global
    // mobile bottom-sheet treatment (slide-up, rounded-top-only, 90vh
    // scroll card) that real dialogs correctly get. addPanelClass() here
    // means every dialog.open(LoadingComponent, ...) call site gets this
    // automatically, with no call-site changes needed. See .gh-loading-panel
    // in styles.scss.
    //
    // GUARD: this component is ALSO used as a bare embedded element outside
    // any MatDialog (e.g. employer-panel.component.html's <app-loading>
    // inside a plain *ngIf, with no dialog.open() involved) -- there,
    // dialogRef is not a functioning real MatDialogRef and calling
    // addPanelClass() on it threw at runtime. Only call it when it's
    // actually available.
    if (this.dialogRef && typeof this.dialogRef.addPanelClass === 'function') {
      this.dialogRef.addPanelClass('gh-loading-panel');
    }
  }

  ngOnInit(): void {
    if(this.data.selfClose) {
      // OVERLAY-AUDIT FIX: the `3000` was a discarded comma-expression value
      // inside the callback body, not setTimeout's delay argument -- this
      // closed immediately instead of after 3 seconds. Currently dormant
      // (no real call site passes selfClose: true) but genuinely broken.
      setTimeout(() => this.dialogRef.close(), 3000);
    }

  }

}
