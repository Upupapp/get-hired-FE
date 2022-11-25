import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile-details-form',
  templateUrl: './profile-details-form.component.html',
  styleUrls: ['./profile-details-form.component.scss'],
  animations: [mainAnimations]
})
export class ProfileDetailsFormComponent implements OnInit {
  @Input() formGroupName: string;

  private req: Subscription;

  profileDetailsForm!: FormGroup;

  public workSetup: string[] = ["Hybrid", "Remote", "Onsite"];
  public workSetupSelected: string = "";
  public jobType: string[] = ["Full-time", "Part-time"];
  public jobLevel: string[] = ["Intern/Student", "Fresher/Entry Level", "Intermediate: 2-3 Years Experience", "Advance: 5 Years+ Experience", "C-Level"]

  public title: string = '';
  public job_type: string = '';
  public job_description: string = '';
  public job_duties: string = '';
  public profileImage: any;

  constructor(
    private snackBar: MatSnackBar,
    private rootFormGroup: FormGroupDirective,
  ) { }

  ngOnInit(): void {
    // this.profileDetailsForm = this.formBuilder.group({
    //   first_name: [''],
    //   last_name: [''],
    //   email: ['',/* [Validators.required]*/],
    //   phone: [''],
    //   address: [''],
    //   city: [''],
    //   country: [''],
    //   profile_photo: [''],

    //   current_job_title: [''],
    //   job_type: [''],
    //   work_setup: [''],
    //   short_bio: [''],
    //   level_of_experience: [''],
    //   expected_salary_min: [0],
    //   expected_salary_max: [0],
    // });

    this.profileDetailsForm = this.rootFormGroup.control.get(this.formGroupName) as FormGroup;
  }

  onUpload(file: any) {
    this.profileImage = file.file;
    this.profileDetailsForm.controls['profile_photo'].setValue(file)
  }
}
