import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export type AiRecoveryReconciliationResult = 'continue' | 'new' | 'cancel';

export interface AiRecoveryReconciliationDialogData {
  /** Existing authenticated recovery's job title, if it has one yet. */
  existingTitle: string;
  /** Guest-started recovery's job title, if it has one yet. */
  newTitle: string;
}

/** GETHIRED_AI_CREATE_GUEST_AUTHENTICATED_RECOVERY_RECONCILIATION_CLOSURE:
 *  shown only when an authenticated Employer's own AI Create recovery AND a
 *  still-valid guest recovery from their own Start-Hiring resume journey
 *  BOTH exist at once (see AiCreateDraftService.detectReconciliation()).
 *  Exactly one of three explicit outcomes -- never a silent/automatic
 *  choice, never a second AI Create panel. Cancel and the X are equivalent:
 *  both leave every recovery exactly as it was (disableClose deliberately
 *  left false, matching this app's other confirmation dialogs -- Escape/
 *  backdrop-click are the same as Cancel). */
@Component({
  selector: 'app-ai-recovery-reconciliation-dialog',
  templateUrl: './ai-recovery-reconciliation-dialog.component.html',
  styleUrls: ['./ai-recovery-reconciliation-dialog.component.scss'],
})
export class AiRecoveryReconciliationDialogComponent {
  existingTitle: string;
  newTitle: string;

  constructor(
    public dialogRef: MatDialogRef<AiRecoveryReconciliationDialogComponent, AiRecoveryReconciliationResult>,
    @Inject(MAT_DIALOG_DATA) public data: AiRecoveryReconciliationDialogData,
  ) {
    this.existingTitle = (data && data.existingTitle) || 'Untitled job';
    this.newTitle = (data && data.newTitle) || 'Untitled job';
  }

  cancel(): void {
    this.dialogRef.close('cancel');
  }

  continueExisting(): void {
    this.dialogRef.close('continue');
  }

  useNewJob(): void {
    this.dialogRef.close('new');
  }
}
