import { Component, Input, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ApplicantFacade } from '@app-applicant/state/applicant.facade';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { ConfirmationDialogComponent } from '@app-shared/components/confirmation-dialog/confirmation-dialog.component';
import { SnackbarService } from '@app-core/services/snackbar.service';
import { Subscription } from 'rxjs';
import { ProfileBasicInfoComponent } from './profile-basic-info/profile-basic-info.component';

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

  // PROFILE-SETUP PHASE 1 FIX (confirmed P1): reuses the existing
  // returnURL localStorage mechanism (see application-process.component.ts
  // redirectToUpdate()) rather than a parallel one. Any successful save on
  // any Career Profile section, while a job-specific returnURL is pending,
  // sends the applicant back to that exact job instead of leaving them
  // stranded here. Consumed once (read + removed immediately) so it can
  // never fire again in a later, unrelated editing session, and validated
  // to be an internal /jobs/details/ path only -- never an open redirect.
  private success$ = this.applicantFacade.success$
    .pipe().subscribe(this.consumeReturnUrlOnSave.bind(this))

  applicantProfileId: string;
  loading: boolean;
  basicFormValid: boolean;
  stepper: number = 1;
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

  /** See the success$ subscription doc comment above. */
  private consumeReturnUrlOnSave(event: any): void {
    if (!event) return;
    const returnUrl = localStorage.getItem('returnURL');
    if (!returnUrl || !returnUrl.startsWith('/jobs/details/')) return;
    localStorage.removeItem('returnURL');
    this.snackbarService.success('Profile updated. Taking you back to the job.', '', 3000);
    this.router.navigateByUrl(returnUrl);
  }

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

  saveProgress(currentStepper: number) {
    switch(currentStepper) {
      case 1:
        this.basicInfo.submitForm();
        break;
      case 2:
        break;
      case 3:
        break;
    }


  }

  saveProgressConfirmation(event: number) {
    if(this.stepper != event) {
      const ref = this.dialog.open(ConfirmationDialogComponent, {
        disableClose: true,
        data: {
          action: `Save Step ${this.stepper}`,
        },
      });

      this.confirmation$ = ref
        .afterClosed()
        .pipe()
        .subscribe((result) => {
          if (result == 1) {
            this.saveProgress(this.stepper);
            this.stepper = event;

          }
        });
    }
  }

  redirectToProfile() {
    this.router.navigateByUrl('user/profile/details');
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if(this.confirmation$) {
      this.confirmation$.unsubscribe();
    }
    if (this.success$) {
      this.success$.unsubscribe();
    }
  }

}
