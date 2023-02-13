import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ApplicantFacade } from '@app-applicant/state/applicant.facade';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { ConfirmationDialogComponent } from '@app-shared/components/confirmation-dialog/confirmation-dialog.component';
import { Subscription } from 'rxjs';
import { ProfileBasicInfoComponent } from './profile-basic-info/profile-basic-info.component';

@Component({
  selector: 'app-profile-forms',
  templateUrl: './profile-forms.component.html',
  styleUrls: ['./profile-forms.component.scss'],
  animations: [mainAnimations]
})
export class ProfileFormsComponent implements OnInit {
  @ViewChild(ProfileBasicInfoComponent) basicInfo:ProfileBasicInfoComponent;
  @Input() user: any;

  confirmation$: Subscription;
  details$ = this.applicantFacade.applicantDetails$
    .pipe().subscribe(this.getBasicInfo.bind(this))

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
  }

}
