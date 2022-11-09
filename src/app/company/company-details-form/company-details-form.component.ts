import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EmployeeCompany } from '@main/employee/employee.model';
import { mainAnimations } from '@main/shared/animations/main-animations';
import { LoadingComponent } from '@main/shared/components/loading/loading.component';
import { industries } from '@main/views/company-panel/pages/jobs/utils/jobs-model-interface';
import { Subscription } from 'rxjs';
import { CompanyFacade } from '../state/company.facade';

@Component({
  selector: 'app-company-details-form',
  templateUrl: './company-details-form.component.html',
  styleUrls: ['./company-details-form.component.scss'],
  animations: [mainAnimations]
})
export class CompanyDetailsFormComponent implements OnInit {

  private req: Subscription;
  public companyDetailsForm!: FormGroup;

  workSetup: string[] = ["Hybrid", "Remote", "Onsite"];
  public workSetupSelected: string = "";
  public industries: string[] = industries;
  // public jobLevel: string[] = ["Intern/Student", "Fresher/Entry Level", "Intermediate: 2-3 Years Experience", "Advance: 5 Years+ Experience", "C-Level"]

  public title: string = '';
  public job_type: string = '';
  public job_description: string = '';
  public job_duties: string = '';
  public profileImage: any;
  canView: boolean;

  success$ = this.companyFacade.success$
    .pipe().subscribe(this.afterSubmit.bind(this));

  company$ = this.companyFacade.companyDetails$
    .pipe().subscribe(this.setCompany.bind(this));

  loading$ = this.companyFacade.loading$
    .pipe()
    .subscribe(this.formLoading.bind(this));

  constructor(
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private companyFacade: CompanyFacade,
    private loadingDialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.companyDetailsForm = this.formBuilder.group({
      companyEmail: ['', [Validators.required, Validators.email]],
      companyContactNumber: [''],
      companyAddress: [''],
      companyCity: ['', [Validators.required]],
      companyCountry: ['', [Validators.required]],
      companyLogoUrl: [''],
      companyName: ['', [Validators.required]],
      companyDetails: [''],
      industryId: [''],
      workSetupId: ['', [Validators.required]],
      numberOfEmployee: [0],
      companyLogoFile: []
    });
  }

  setCompany(company: EmployeeCompany) {
    if (company && company.companyId != null) {
      const {
        companyName
      } = company;

      this.companyDetailsForm.get('companyName')?.setValue(companyName);
    }
  }

  onUpload(file: any) {
    this.profileImage = file.file;
    this.companyDetailsForm.controls['companyLogoFile'].setValue(this.profileImage)
  }

  onSubmit() {
    if (this.companyDetailsForm.valid) {
      this.companyFacade.createCompany({
        ...this.companyDetailsForm.value,
        workSetupId: parseInt(this.companyDetailsForm.controls.workSetupId.value),
        industryId: parseInt(this.companyDetailsForm.controls.industryId.value)
      });
    }
  }

  afterSubmit(event) {
    if (event == 'created') {
      this.snackBar.open(`Company successfully setup. You can now access other features`, '', {
        duration: 4000,
        panelClass: ['success-snackbar'],
      });
    }
  }

  formLoading(loading: boolean) {
    if (loading) {

      const ref = this.loadingDialog.open(LoadingComponent, {
        disableClose: true,
        data: {
          selfClose: false
        }
      });
    } else{
      setTimeout(() => this.loadingDialog.closeAll(), 2000);
    }
  }
}
