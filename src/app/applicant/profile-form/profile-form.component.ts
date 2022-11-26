import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { distinctUntilChanged, Subscription } from 'rxjs';
import { ApplicantFacade } from '../state/applicant.facade';

@Component({
  selector: 'app-profile-form',
  templateUrl: './profile-form.component.html',
  styleUrls: ['./profile-form.component.scss']
})
export class ProfileFormComponent implements OnInit {
  profileForm: FormGroup;
  subscriptions$ = new Subscription();

  public stepperItems: any[] = [
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

  public stepper: number = 1;

  constructor(
    private fb: FormBuilder,
    private applicantFacade: ApplicantFacade
  ) { }

  ngOnInit(): void {
    this.initializedForm();
  }

  initializedForm() {
    const user = JSON.parse(localStorage.getItem('user'));

    this.profileForm = this.fb.group({
      profileDetailsForm: this.fb.group({
        profilePhoto: [null],
        profilePhotoFile: new FormArray([]),
        jobTitle: [null],
        shortBio: [null],
        servicesProvided: [null],
        jobTypeId: [null],
        jobLevelId: [null],
        workSetupId: [null],
        salaryMinimum: [null],
        salaryMaximum: [null],
        firstName: [user.firstName, Validators.required],
        lastName: [user.lastName, Validators.required],
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

    this.subscriptions$.add(
      this.profileForm.controls.profileDetailsForm.statusChanges.pipe(distinctUntilChanged()).subscribe((status) => {
        this.stepperItems[1].disabled = status != 'VALID'

      }));
  }

  changeStep(step: number, formName?: string): void {
    this.stepper = step;

    switch (formName) {
      case 'profileDetailsForm':
        const bodyInitial = this.profileForm.controls[formName].value;
        this.applicantFacade.setInitialForm(bodyInitial);
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

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.subscriptions$.unsubscribe();
  }

}
