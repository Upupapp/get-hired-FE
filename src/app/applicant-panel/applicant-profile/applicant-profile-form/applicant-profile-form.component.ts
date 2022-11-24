import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-applicant-profile-form',
  templateUrl: './applicant-profile-form.component.html',
  styleUrls: ['./applicant-profile-form.component.scss']
})
export class ApplicantProfileFormComponent implements OnInit {
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

  constructor(
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
  }

  changeStep(step: number): void {
    this.stepper = step;

  }
}
