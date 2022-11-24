import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.initializedForm();
  }

  initializedForm() {
    this.profileForm = this.fb.group({
      profileDetailsForm: this.fb.group({
        profilePhotoFile: [null],
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
        country: [null, Validators.required],
      }),
      profileArraysForm: this.fb.group({

      }),
      profileDocuments: this.fb.group({

      })
    });
  }

  changeStep(step: number): void {
    this.stepper = step;
  }

}
