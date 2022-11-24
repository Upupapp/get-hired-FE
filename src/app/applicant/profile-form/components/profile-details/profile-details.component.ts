import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { MatSnackBar } from '@angular/material/snack-bar';
import { mainAnimations } from '@app-shared/animations/main-animations';

@Component({
  selector: 'app-profile-details',
  animations: [mainAnimations],
  templateUrl: './profile-details.component.html',
  styleUrls: ['./profile-details.component.scss']
})
export class ProfileDetailsComponent implements OnInit {
  private req: Subscription;
  public profileDetailsForm!: FormGroup;

  public workSetup: string[] = ["Hybrid", "Remote", "Onsite"];
  public workSetupSelected: string = "";
  public jobType: string[] = ["Full-time", "Part-time"];
  public jobLevel: string[] = ["Intern/Student", "Fresher/Entry Level", "Intermediate: 2-3 Years Experience", "Advance: 5 Years+ Experience", "C-Level"]
  
  public title: string = '';
  public job_type: string = '';
  public job_description: string = '';
  public job_duties: string = '';
  public profileImage: any; 
  constructor(private formBuilder: FormBuilder,
    private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.profileDetailsForm = this.formBuilder.group({
      first_name: [''],
      last_name: [''],
      email: ['',/* [Validators.required]*/],
      phone: [''],
      address: [''],
      city: [''], 
      country: [''],
      profile_photo: [''],  

      current_job_title: [''],
      job_type: [''],
      work_setup: [''],
      short_bio: [''],
      level_of_experience: [''], 
      expected_salary_min: [0],
      expected_salary_max: [0],
    });
  }

  onUpload(file: any) {
    this.profileImage = file.file;
    this.profileDetailsForm.controls['profile_photo'].setValue(file)
  }
}
