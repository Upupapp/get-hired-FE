import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

export type ProfileSetupChoice = 'apply-now' | 'continue-setup';

/**
 * Shown right after Step 1 (Profile Details) saves successfully, but only
 * when the applicant arrived here via "you need a profile to apply for this
 * job" (a pending job returnURL exists -- see profile-forms.component.ts's
 * onBasicInfoSaveResult()). Lets them choose between applying immediately
 * with just what they've entered so far, or continuing through Skills &
 * Experience / Documents for a fuller profile before returning to the job.
 * Neither choice is a dead end -- both eventually land back on the job
 * application via redirectToProfile()'s existing returnURL handling.
 */
@Component({
  selector: 'app-profile-setup-choice-dialog',
  templateUrl: './profile-setup-choice-dialog.component.html',
  styleUrls: ['./profile-setup-choice-dialog.component.scss']
})
export class ProfileSetupChoiceDialogComponent {
  constructor(public dialogRef: MatDialogRef<ProfileSetupChoiceDialogComponent, ProfileSetupChoice>) { }

  choose(choice: ProfileSetupChoice): void {
    this.dialogRef.close(choice);
  }
}
