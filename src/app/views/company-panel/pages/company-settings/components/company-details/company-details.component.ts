import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { MatSnackBar } from '@angular/material/snack-bar';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { industries } from '../../../jobs/utils/jobs-model-interface';

@Component({
  selector: 'app-company-settings-details',
  animations: [mainAnimations],
  templateUrl: './company-details.component.html',
  styleUrls: ['./company-details.component.scss']
})
export class CompanyDetailsComponent implements OnInit {

  private req: Subscription;
  public profileDetailsForm!: FormGroup;

  public workSetup: string[] = ["Hybrid", "Remote", "Onsite"];
  public workSetupSelected: string = "";
  public industries: string[] = industries;
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
      email: ['',/* [Validators.required]*/],
      phone: [''],
      address: [''],
      city: [''],
      country: [''],

      company_logo: [''],
      company_name: [''],
      company_details: [''],
      industry_type: [''],
      work_setup: [''],
      number_of_employee: [0],
    });
  }

  onUpload(file: any) {
    this.profileImage = file.file;
    this.profileDetailsForm.controls['company_logo'].setValue(file)
  }

}
