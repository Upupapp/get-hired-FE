import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EmployeeCompany } from '@main/employee/employee.model';
import { mainAnimations } from '@main/shared/animations/main-animations';
import { LoadingComponent } from '@main/shared/components/loading/loading.component';
import { industries } from '@main/views/company-panel/pages/jobs/utils/jobs-model-interface';
import { Subscription } from 'rxjs';
import { CompanyFacade } from '../state/company.facade';
import * as Model from '../company.model';
import { ActivatedRoute, Router } from '@angular/router';
import { UpdatedDialogComponent } from '@app-shared/components/updated-dialog/updated-dialog.component';

@Component({
  selector: 'app-company-details-form',
  templateUrl: './company-details-form.component.html',
  styleUrls: ['./company-details-form.component.scss'],
  animations: [mainAnimations],
})
export class CompanyDetailsFormComponent implements OnInit, OnDestroy {
  asyncLocalStorage = {
    setItem: async function (key, value) {
      await Promise.resolve();
      localStorage.setItem(key, value);
    },
    getItem: async function (key) {
      await Promise.resolve();
      return localStorage.getItem(key);
    },
  };

  private req: Subscription;
  public companyDetailsForm!: FormGroup;

  workSetup: string[] = ['Hybrid', 'Remote', 'Onsite'];
  public workSetupSelected: string = '';
  public industries: string[] = industries;
  // public jobLevel: string[] = ["Intern/Student", "Fresher/Entry Level", "Intermediate: 2-3 Years Experience", "Advance: 5 Years+ Experience", "C-Level"]

  company: Model.Company;

  public title: string = '';
  public job_type: string = '';
  public job_description: string = '';
  public job_duties: string = '';
  public profileImage: any;
  canView: boolean;

  success$ = this.companyFacade.success$
    .pipe()
    .subscribe(this.afterSubmit.bind(this));

  company$ = this.companyFacade.companyDetails$
    .pipe()
    .subscribe(this.setCompany.bind(this));

  loading$ = this.companyFacade.loading$
    .pipe()
    .subscribe(this.formLoading.bind(this));

  constructor(
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private companyFacade: CompanyFacade,
    private loadingDialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.companyFacade.getCompany();

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
      companyLogoFile: [],
    });
  }

  setCompany(company: EmployeeCompany) {
    console.log(company);
    if (company && company.companyId != null) {
      this.company = company;
      const {
        companyName,
        companyEmail,
        companyContactNumber,
        companyAddress,
        companyCity,
        companyCountry,
        companyLogoUrl,
        companyDetails,
        industryId,
        workSetupId,
        numberOfEmployee,
      } = company;

      this.companyDetailsForm.get('companyName')?.setValue(companyName);
      this.companyDetailsForm.get('companyEmail')?.setValue(companyEmail);
      this.companyDetailsForm
        .get('companyContactNumber')
        ?.setValue(companyContactNumber);
      this.companyDetailsForm.get('companyAddress')?.setValue(companyAddress);
      this.companyDetailsForm.get('companyCity')?.setValue(companyCity);
      this.companyDetailsForm.get('companyCountry')?.setValue(companyCountry);
      this.companyDetailsForm.get('companyDetails')?.setValue(companyDetails);
      this.companyDetailsForm.get('industryId')?.setValue(industryId);
      this.companyDetailsForm.get('workSetupId')?.setValue(workSetupId);
      this.companyDetailsForm
        .get('numberOfEmployee')
        ?.setValue(numberOfEmployee);
      this.companyDetailsForm.get('companyLogoUrl')?.setValue(companyLogoUrl);

      this.profileImage = companyLogoUrl;
      this.canView = true;
    }
  }

  redirectToPreview() {
    console.log(this.router.config);
    // this.router.navigate(['../company-details'], {relativeTo: this.route });
  }

  onUpload(file: any) {
    this.profileImage = file.file;
    this.companyDetailsForm.controls['companyLogoFile'].setValue(
      this.profileImage
    );
  }

  onSubmit() {
    if (this.companyDetailsForm.valid) {
      if (this.company && this.company.companyId) {
        this.companyFacade.updateCompany({
          ...this.companyDetailsForm.value,
          companyId: this.company.companyId,
          workSetupId: parseInt(
            this.companyDetailsForm.controls.workSetupId.value
          ),
          industryId: parseInt(
            this.companyDetailsForm.controls.industryId.value
          ),
        });
      } else {
        this.companyFacade.createCompany({
          ...this.companyDetailsForm.value,
          workSetupId: parseInt(
            this.companyDetailsForm.controls.workSetupId.value
          ),
          industryId: parseInt(
            this.companyDetailsForm.controls.industryId.value
          ),
        });
      }
    }
  }

  afterSubmit(event) {
    console.log(event);
    if (event == 'created') {
      this.updateLocalStorage();
      this.dialog.open(UpdatedDialogComponent, {
        disableClose: false,
        data: 'Company successfully setup. You can now access other features',
      });
    } else if (event == 'updated') {
      this.dialog.open(UpdatedDialogComponent, {
        disableClose: false,
        data: 'Company successfully Updated',
      });
    }
  }

  async updateLocalStorage() {
    const user = await this.asyncLocalStorage.getItem('user');
    this.asyncLocalStorage.setItem(
      'user',
      JSON.stringify({
        ...JSON.parse(user),
        companyName: this.companyDetailsForm.get('companyName').value,
      })
    );
  }

  formLoading(loading: boolean) {
    if (loading) {
      const ref = this.loadingDialog.open(LoadingComponent, {
        disableClose: true,
        data: {
          selfClose: false,
        },
      });
    } else {
      setTimeout(() => this.loadingDialog.closeAll(), 2000);
    }
  }

  ngOnDestroy(): void {
    this.companyFacade.resetStateNotif();
  }
}
