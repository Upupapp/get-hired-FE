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
 *  MatDialog's own default -- disableClose is deliberately left false). */
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
  /** TAB 05 (optional privacy control): unchecked by default. When checked
   *  at confirm time, the caller removes only the current Employer's LOCAL
   *  AI recovery after a successful sign-out -- never a canonical server
   *  Draft job. Kept visually separate from the two primary actions (see
   *  template) so it can't be mistaken for part of the Cancel/Sign Out
   *  decision itself. */
  removeLocalRecovery = false;

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
