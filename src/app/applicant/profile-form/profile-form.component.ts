import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApplicantFacade } from '../state/applicant.facade';

@Component({
  selector: 'app-profile-form',
  templateUrl: './profile-form.component.html',
  styleUrls: ['./profile-form.component.scss']
})
export class ProfileFormComponent implements OnInit {
  public stepperItems: any[] = [
    {
      id: 1,
      title: "Profile Details",
      valid: true
    },

    {
      id: 2,
      title: "Skills and Experience",
      valid: true
    },

    {
      id: 3,
      title: "Documents",
      valid: true
    },
  ];

  public stepper: number = 1;

  profileForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private applicantFacade: ApplicantFacade
  ) { }

  ngOnInit(): void {
    this.initializedForm();
  }

  initializedForm() {
    this.profileForm = this.fb.group({
      profileDetailsForm: this.fb.group({
        profilePhoto: [null],
        jobTitle: [null],
        shortBio: [null],
        servicesProvided: [null],
        jobTypeId: [null],
        jobLevelId: [null],
        workSetupId: [null],
        salaryMinimum: [null],
        salaryMaximum: [null],
        firstName: [null, Validators.required],
        lastName: [null, Validators.required],
        // email: [{ value: '', disabled: true }, Validators.required],
        address: [null],
        contactNumber: [null, Validators.required],
        city: [null, Validators.required],
        country: [null, Validators.required]
      }),
      profileArraysForm: this.fb.group({

      }),
      profileDocuments: this.fb.group({

      })
    });
  }

  changeStep(step: number, formName?: string): void {
    this.stepper = step;

    switch (formName) {
      case 'profileDetailsForm':
        const bodyInitial = this.profileForm.controls[formName].value;
        this.applicantFacade.setInitialForm(bodyInitial);
        // this.jobFacade.saveInitialForm(bodyInitial);
        break;
      case 'profileArraysForm':
        const bodyInfo = this.profileForm.controls[formName].value;
        // this.jobFacade.saveJobInfo(bodyInfo);
        break;
      case 'profileDocuments':
        const bodyInterview = this.profileForm.controls[formName].value;
        // this.jobFacade.saveInterview(bodyInterview.interviewQuestions)
        break;
    }
  }

}
