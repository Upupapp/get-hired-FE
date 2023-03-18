import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EmployeeCompany } from '@main/employee/employee.model';
import { mainAnimations } from '@main/shared/animations/main-animations';
import { LoadingComponent } from '@main/shared/components/loading/loading.component';
import { CompanyFacade } from '../state/company.facade';
import * as Model from '../company.model';
import { ActivatedRoute, Router } from '@angular/router';
import { SuccessDialogComponent } from '@main/shared/components/success-dialog/success-dialog.component';
import { Subscription, Subject, takeUntil } from 'rxjs';
import { UpdatedDialogComponent } from '@app-shared/components/updated-dialog/updated-dialog.component';

@Component({
  selector: 'app-company-details-form',
  templateUrl: './company-details-form.component.html',
  styleUrls: ['./company-details-form.component.scss'],
  animations: [mainAnimations],
})
export class CompanyDetailsFormComponent implements OnInit, OnDestroy {
  public unsubscribe$ = new Subject<void>();
  @Output() updateCompany: EventEmitter<any> = new EventEmitter();

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



  companyDetailsForm!: FormGroup;
  company: Model.Company;
  companyId: string;
  profileImage: any;
  canView: boolean;
  updateSuccess: boolean = false;
  rawAddress: any;
  loading: boolean = true;

  workSetup$ = this.companyFacade.setup$;
  industry$ = this.companyFacade.industry$;

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
    private successDialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.companyFacade.getCompany();
    this.companyFacade.getIndustry();
    this.companyFacade.getSetup();

    this.companyDetailsForm = this.formBuilder.group({
      companyEmail: ['', [Validators.required, Validators.email]],
      companyContactNumber: ['', Validators.required],
      companyAddress: [null],
      companyCity: ['', [Validators.required]],
      companyCountry: ['', [Validators.required]],
      companyLogoUrl: [''],
      companyName: ['', [Validators.required]],
      companyDetails: [''],
      industryId: [null],
      workSetupId: [null, [Validators.required]],
      numberOfEmployee: [0],
      companyLogoFile: [],
      companyState: [],
      companyAddressOne: [],
      companyTown: [],
      companyZip: [],
      companyMapUrl: [],
      shownPublicly: []
    });

    //this.showSuccessDialog()
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
        companyState,
        companyTown,
        companyZip,
        companyMapUrl,
        companyAddressOne,
        companyLogoUrl,
        companyDetails,
        industryId,
        workSetupId,
        numberOfEmployee,
        shownPublicly
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
      this.companyDetailsForm.get('shownPublicly').setValue(shownPublicly);

      this.profileImage = companyLogoUrl;
      this.canView = true;
      this.rawAddress = {
        address: companyAddress,
        state: companyState,
        country: companyCountry,
        addressOne: companyAddressOne,
        town: companyTown,
        city: companyCity,
        zipcode: companyZip,
        mapUrl: companyMapUrl
      }
      this.updateLocalStorage();
    }
  }

  addressChange(event) {
    this.companyDetailsForm.get('companyAddress')?.setValue(event.address);
    this.companyDetailsForm.get('companyCity')?.setValue(event.city);
    this.companyDetailsForm.get('companyCountry')?.setValue(event.country);
    this.companyDetailsForm.get('companyState').setValue(event.state);
    this.companyDetailsForm.get('companyAddressOne').setValue(event.addressOne);
    this.companyDetailsForm.get('companyTown').setValue(event.town);
    this.companyDetailsForm.get('companyZip').setValue(event.zipcode);
    this.companyDetailsForm.get('companyMapUrl').setValue(event.mapUrl);
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
    this.updateSuccess = true;

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
      const create = this.dialog.open(UpdatedDialogComponent, {
        disableClose: false,
        data: 'Company successfully setup. You can now access other features',
      });

      create
        .afterClosed()
        .pipe()
        .subscribe(() => this.router.navigate(['../details'], { relativeTo: this.route }));
    } else if (event == 'updated') {
      this.dialog.open(UpdatedDialogComponent, {
        disableClose: false,
        data: 'Company successfully Updated',
      });
      this.loadingDialog.closeAll();
      this.showSuccessDialog();
    }
  }

  updateLocalStorage() {
    const user = localStorage.getItem('user');
    localStorage.removeItem('user');
    localStorage.setItem('user', JSON.stringify({
      ...JSON.parse(user),
      companyName: this.company.companyName,
      companyId: this.company.companyId
    }));

    this.updateCompany.emit({
      status: true,
      userId: JSON.parse(user)._id
    });
  }

  formLoading(loading: boolean) {
    this.loading = loading;
    if (loading) {
      const ref = this.loadingDialog.open(LoadingComponent, {
        disableClose: true,
        data: {
          selfClose: false,
        },
      });
    } else {
      // dont close automatically all modal
      // if (!this.updateSuccess) {
      setTimeout(() => this.loadingDialog.closeAll(), 3000);
      // }
    }
  }

  showSuccessDialog() {
    let openDialog = this.successDialog.open(
      SuccessDialogComponent,
      {
        width: '29vw',
        data: {
          title: 'Update Details',
          subtitle: 'Successfully updated company details'
        },
      }
    );

    openDialog
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(result => {
        this.updateSuccess = false
      });
  }

  ngOnDestroy(): void {
    this.companyFacade.resetStateNotif();
  }
}
