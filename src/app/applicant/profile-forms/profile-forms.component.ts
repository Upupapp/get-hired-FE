import { Component, Input, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ApplicantFacade } from '@app-applicant/state/applicant.facade';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { ConfirmationDialogComponent } from '@app-shared/components/confirmation-dialog/confirmation-dialog.component';
import { SnackbarService } from '@app-core/services/snackbar.service';
import { Subscription } from 'rxjs';
import { ProfileBasicInfoComponent } from './profile-basic-info/profile-basic-info.component';
import { ProfileSetupChoiceDialogComponent, ProfileSetupChoice } from './profile-setup-choice-dialog/profile-setup-choice-dialog.component';

@Component({
  selector: 'app-profile-forms',
  templateUrl: './profile-forms.component.html',
  styleUrls: ['./profile-forms.component.scss'],
  animations: [mainAnimations]
})
export class ProfileFormsComponent implements OnInit, OnDestroy {
  @ViewChild(ProfileBasicInfoComponent) basicInfo:ProfileBasicInfoComponent;
  @Input() user: any;

  confirmation$: Subscription;
  details$ = this.applicantFacade.applicantDetails$
    .pipe().subscribe(this.getBasicInfo.bind(this))

  applicantProfileId: string;
  loading: boolean;
  basicFormValid: boolean;
  stepper: number = 1;
  // BUGFIX: the target step, set only while a Step 1 save is in flight so
  // navigation can wait for the real outcome instead of firing blind (see
  // onBasicInfoSaveResult() and profile-basic-info.component.ts's saveResult
  // output for the full explanation).
  private pendingAdvanceTo: number | null = null;
  stepperItems: any[] = [
    {
      id: 1,
      title: "Profile Details",
      formName: 'profileDetailsForm'

    },
    {
      id: 2,
      title: "Skills and Experience",
      disabled: true,
      formName: 'initialData'

    },
    {
      id: 3,
      title: "Documents",
      disabled: true,
      formName: ''
    },
  ];

  constructor(
    private dialog: MatDialog,
    private applicantFacade: ApplicantFacade,
    private router: Router,
    private snackbarService: SnackbarService,
  ) { }

  ngOnInit(): void {
    if (this.user) {
      this.applicantFacade.getApplicantById(this.user._id);
    }
  }

  getBasicInfo(data) {
    if(data && data.applicantProfileId && this.basicInfo) {
      this.applicantProfileId = data.applicantProfileId;
    }

    if(this.applicantProfileId) {
      this.stepperItems[1].disabled = false;
      this.stepperItems[2].disabled = false
    }
  }

  submitBasicInfo(event) {
    console.log(event);
    if(event == 'VALID') {
      this.basicFormValid = true;
      this.stepperItems[2].disabled = false
    }
  }

  saveProgress(currentStepper: number, target: number) {
    switch(currentStepper) {
      case 1:
        // BUGFIX: previously this fired the save and the caller advanced
        // this.stepper on the very next line regardless -- *ngIf="stepper
        // === 1" then destroyed ProfileBasicInfoComponent immediately,
        // tearing down its success$/error$ subscriptions before the async
        // HTTP response could ever reach them. A failed save (or one that
        // simply hadn't finished yet) was indistinguishable from a
        // successful one: the user just silently landed on Step 2. Now
        // navigation itself waits for the real outcome -- see
        // onBasicInfoSaveResult(), which is the only place this.stepper
        // gets set for this case.
        this.pendingAdvanceTo = target;
        this.basicInfo.submitForm();
        break;
      case 2:
        this.stepper = target;
        break;
      case 3:
        this.stepper = target;
        break;
    }
  }

  // Bound to app-profile-basic-info's (saveResult) output. Only reacts
  // while a Step-1-triggered navigation is actually pending, so it can't
  // fire from some unrelated save happening to resolve at the same time.
  onBasicInfoSaveResult(result: 'success' | 'error'): void {
    if (this.pendingAdvanceTo === null) return;
    if (result === 'success') {
      // Only offer the "apply now vs continue setup" fork right after
      // Step 1 specifically (pendingAdvanceTo === 2, i.e. this save was
      // triggered by Step 1's own Next), and only when there's an actual
      // pending job to return to -- an applicant editing their profile
      // through the normal (non-apply) route has no job to fork toward,
      // so they just advance to Step 2 as before.
      const returnUrl = localStorage.getItem('returnURL');
      const hasPendingJob = !!returnUrl && returnUrl.startsWith('/jobs/details/');
      if (this.pendingAdvanceTo === 2 && hasPendingJob) {
        // BUGFIX: capture the return URL now, before the dialog opens --
        // showProfileSetupChoice() previously re-read localStorage itself,
        // later, inside redirectToProfile(). Passing it through explicitly
        // means "Apply Now" can never silently lose its destination to
        // something else clearing/overwriting that key in the meantime.
        this.showProfileSetupChoice(returnUrl);
      } else {
        this.stepper = this.pendingAdvanceTo;
      }
    }
    // On error, stay on Step 1 -- profile-basic-info.component.ts has
    // already shown the user why (invalid fields or a failed save).
    this.pendingAdvanceTo = null;
  }

  // Lets the applicant choose, right after Step 1 saves, between applying
  // immediately with just what they've entered or continuing through
  // Skills & Experience / Documents first -- neither is a dead end, both
  // eventually return to the job via redirectToProfile()'s own returnURL
  // handling. disableClose forces an explicit choice rather than leaving
  // the applicant on an ambiguous half-state if they dismiss it.
  //
  // BUGFIX: reported in production as "picking either button does the same
  // thing -- it always lands on Step 2 instead of waiting for a real
  // choice." The dialog was being opened synchronously from inside the
  // save-success handler, itself invoked from an async HTTP response
  // callback -- a known Angular CDK Overlay race where a dialog opened
  // this way can inherit a stray focus/keyboard event from whatever UI
  // interaction (e.g. pressing Enter to confirm the earlier "Save Step 1"
  // dialog) triggered the save, resolving it before the user's actual
  // click on THIS dialog is ever processed. Two changes address it:
  // deferring the open to the next macrotask (setTimeout) so it starts
  // from a clean event loop tick with nothing left over to inherit, and
  // autoFocus:false so no button auto-receives keyboard focus at all --
  // only an explicit mouse/touch click (or explicit Tab+Enter) can choose.
  private showProfileSetupChoice(returnUrl: string | null): void {
    setTimeout(() => {
      const ref = this.dialog.open(ProfileSetupChoiceDialogComponent, {
        width: 'min(420px, 92vw)',
        disableClose: true,
        autoFocus: false,
      });

      ref.afterClosed().subscribe((choice: ProfileSetupChoice) => {
        if (choice === 'apply-now') {
          this.redirectToProfile(returnUrl);
        } else {
          // 'continue-setup' (the only other real outcome, since disableClose
          // prevents a bare dismissal) -- proceed into Step 2 as normal.
          this.stepper = 2;
        }
      });
    });
  }

  saveProgressConfirmation(event: number) {
    if(this.stepper != event) {
      const ref = this.dialog.open(ConfirmationDialogComponent, {
        disableClose: true,
        data: {
          // APP-016 fix: ConfirmationDialogComponent's template already
          // reads "Would you like to save your progress in " + action + "?"
          // -- passing "Save Step N" here duplicated "Save" ("...progress
          // in Save Step 1 ?"). action is only ever used inside that one
          // sentence, so just the step name belongs here.
          action: `Step ${this.stepper}`,
        },
      });

      this.confirmation$ = ref
        .afterClosed()
        .pipe()
        .subscribe((result) => {
          if (result == 1) {
            this.saveProgress(this.stepper, event);
          }
        });
    }
  }

  // BUGFIX: this used to redirect back to the pending job (see
  // returnURL below) the instant Step 1 saved -- consumeReturnUrlOnSave()
  // fired on applicantFacade.success$, a shared event bus across the
  // whole applicant module, so the very first successful save (Step 1)
  // triggered it immediately, before the applicant ever got a chance to
  // continue through Steps 2/3. That defeated the wizard's own "Next"
  // buttons entirely for anyone arriving here from "you need a profile to
  // apply" -- they were bounced back to the job after Basic Info alone,
  // with Skills/Experience and Documents never even offered.
  //
  // The return-to-job redirect now only happens here, at the wizard's own
  // actual finish action -- Step 1 (Profile Details) is still mandatory
  // (gated by its own required-field validation before Next is even
  // enabled, unchanged), while Steps 2 and 3 remain freely skippable
  // exactly as before (their Next/Finish buttons have never required
  // anything to be filled in) -- so this satisfies "let them skip
  // everything except Step 1" without adding a separate skip control.
  redirectToProfile(capturedReturnUrl?: string | null) {
    // Prefer a URL the caller already captured (see showProfileSetupChoice)
    // over re-reading localStorage now -- avoids losing the destination to
    // anything that clears/overwrites that key between capture and here.
    const returnUrl = capturedReturnUrl !== undefined ? capturedReturnUrl : localStorage.getItem('returnURL');
    if (returnUrl && returnUrl.startsWith('/jobs/details/')) {
      localStorage.removeItem('returnURL');
      this.snackbarService.success('Profile updated. Taking you back to the job.', '', 3000);
      this.router.navigateByUrl(returnUrl);
      return;
    }
    this.router.navigateByUrl('user/profile/details');
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if(this.confirmation$) {
      this.confirmation$.unsubscribe();
    }
  }

}
