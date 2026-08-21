import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface SignOutConfirmDialogData {
  /** Invoked when the employer clicks "Sign Out". Does NOT close the dialog --
   *  the caller owns the actual logout call and closes this dialog itself
   *  (via dialogRef) only once it has actually completed, so the disabled/
   *  loading state stays visible for the duration of the real request. */
  onConfirm: () => void;
  /** Whether the current Employer actually has removable LOCAL AI recovery
   *  on this device -- the caller resolves this (it knows the current owner
   *  scope), since the dialog itself has no way to know. The checkbox is
   *  only rendered when true; there's nothing to offer removing otherwise.
   *  This answers "does LOCAL recovery exist", never "does a server Draft
   *  exist" -- a synced server Draft is never affected either way. */
  showRemoveLocalRecoveryOption?: boolean;
  /** True when the local recovery has edits made after its last confirmed
   *  server sync -- drives the truthful unsynced-changes warning shown
   *  under the checkbox instead of the generic synced-safe wording. */
  hasUnsyncedLocalEdits?: boolean;
}

/** Purpose-built Employer sign-out confirmation modal -- title, message, an
 *  X close button in the top-right corner, an optional "remove local
 *  recovery" checkbox (shown only when one actually exists), and two
 *  explicit actions (Cancel / Sign Out). The X and Cancel are equivalent:
 *  both just close the dialog with zero auth/session side effects (same as
 *  Escape/backdrop-click, MatDialog's own default -- disableClose is
 *  deliberately left false).
 *
 *  FINAL SIGN-OUT POLICY: normal Sign Out (checkbox left unchecked)
 *  preserves the current Employer's local AI recovery -- it is never
 *  destroyed merely by signing out. Only checking the box and confirming
 *  removes it, and even then only the LOCAL recovery -- a canonical server
 *  Draft job is never touched by this action. */
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
  /** Unchecked by default. When checked at confirm time, the caller removes
   *  only the current Employer's LOCAL AI recovery after a successful sign-
   *  out -- never a canonical server Draft job. */
  removeLocalRecovery = false;
  /** Drives the checkbox's *ngIf. */
  showRemoveLocalRecoveryOption = false;
  hasUnsyncedLocalEdits = false;

  constructor(
    public dialogRef: MatDialogRef<SignOutConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SignOutConfirmDialogData,
  ) {
    this.showRemoveLocalRecoveryOption = !!(data && data.showRemoveLocalRecoveryOption);
    this.hasUnsyncedLocalEdits = !!(data && data.hasUnsyncedLocalEdits);
  }

  cancel(): void {
    if (this.confirmDisabled) return;
    this.dialogRef.close('cancel');
  }

  confirm(): void {
    if (this.confirmDisabled) return;
    this.data.onConfirm();
  }
}
