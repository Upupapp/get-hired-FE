import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { mainAnimations } from '@main/shared/animations/main-animations';
import { industries } from '@main/views/company-panel/pages/jobs/utils/jobs-model-interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-company-details-form',
  templateUrl: './company-details-form.component.html',
  styleUrls: ['./company-details-form.component.scss'],
  animations: [mainAnimations]
})
export class CompanyDetailsFormComponent implements OnInit {

  private req: Subscription;
  public companyDetailsForm!: FormGroup;

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
    this.companyDetailsForm = this.formBuilder.group({
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
    this.companyDetailsForm.controls['company_logo'].setValue(file)
  }
}
