import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface SignOutConfirmDialogData {
  /** Invoked when the employer clicks "Sign Out". Does NOT close the dialog --
   *  the caller owns the actual logout call and closes this dialog itself
   *  (via dialogRef) only once it has actually completed, so the disabled/
   *  loading state stays visible for the duration of the real request. */
  onConfirm: () => void;
}

/** Purpose-built Employer sign-out confirmation modal -- title, message, an
 *  X close button in the top-right corner, and two explicit actions
 *  (Cancel / Sign Out). The X and Cancel are equivalent: both just close the
 *  dialog with zero auth/session side effects (same as Escape/backdrop-click,
 *  MatDialog's own default -- disableClose is deliberately left false).
 *
 *  PRODUCT CHANGE (2026-08-20): no longer offers an optional "remove local
 *  recovery" checkbox -- Sign Out always removes the signing-out Employer's
 *  unfinished AI Create recovery from this device automatically (see
 *  EmployerPanelComponent.confirmSignOut()). Never touches a canonical
 *  server Draft job either way. */
@Component({
  selector: 'app-sign-out-confirm-dialog',
  templateUrl: './sign-out-confirm-dialog.component.html',
  styleUrls: ['./sign-out-confirm-dialog.component.scss'],
})
export class SignOutConfirmDialogComponent {
  /** Set true by the caller (via dialogRef.componentInstance) once Sign Out
   *  is clicked, so a duplicate click and Cancel/X are both blocked while
   *  the real logout request is in flight. */
  confirmDisabled = false;
  confirmLabel = 'Sign Out';

  constructor(
    public dialogRef: MatDialogRef<SignOutConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SignOutConfirmDialogData,
  ) {}

  cancel(): void {
    if (this.confirmDisabled) return;
    this.dialogRef.close('cancel');
  }

  confirm(): void {
    if (this.confirmDisabled) return;
    this.data.onConfirm();
  }
}
