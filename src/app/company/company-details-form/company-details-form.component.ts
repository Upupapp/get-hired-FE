import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { EmployeeCompany } from '@main/employee/employee.model';
import { mainAnimations } from '@main/shared/animations/main-animations';
import { CompanyFacade } from '../state/company.facade';
import * as Model from '../company.model';
import { ActivatedRoute, Router } from '@angular/router';
import { SnackbarService } from '@app-core/services/snackbar.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UpdatedDialogComponent } from '@app-shared/components/updated-dialog/updated-dialog.component';

@Component({
  selector: 'app-company-details-form',
  templateUrl: './company-details-form.component.html',
  styleUrls: ['./company-details-form.component.scss'],
  animations: [mainAnimations],
})
export class CompanyDetailsFormComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  @Output() updateCompany: EventEmitter<any> = new EventEmitter();

  companyDetailsForm!: FormGroup;
  company: Model.Company;
  companyId: string;
  profileImage: any;
  canView: boolean;
  updateSuccess: boolean = false;
  rawAddress: any;
  loading: boolean = false;
  addressFormValid: boolean = false;

  workSetup$ = this.companyFacade.setup$;
  industry$ = this.companyFacade.industry$;

  constructor(
    private formBuilder: FormBuilder,
    private companyFacade: CompanyFacade,
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private snackbarService: SnackbarService
  ) { }

  ngOnInit(): void {
    this.companyFacade.getCompany();
    this.companyFacade.getIndustry();
    this.companyFacade.getSetup();

    this.companyDetailsForm = this.formBuilder.group({
      companyEmail: ['', [Validators.required, Validators.email]],
      companyContactNumber: [''],
      companyAddress: [null],
      companyCity: [''],
      companyCountry: [''],
      companyLogoUrl: [''],
      companyName: ['', [Validators.required]],
      companyDetails: [''],
      industryId: [null],
      workSetupId: [null],
      numberOfEmployee: [0],
      companyLogoFile: [],
      companyState: [],
      companyAddressOne: [],
      companyTown: [],
      companyZip: [],
      companyMapUrl: [],
      shownPublicly: []
    });

    this.companyFacade.companyDetails$
      .pipe(takeUntil(this.destroy$))
      .subscribe(company => this.setCompany(company as EmployeeCompany));

    this.companyFacade.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => { this.loading = loading; });

    this.companyFacade.success$
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => this.afterSubmit(event));
  }

  setCompany(company: EmployeeCompany) {
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

      // PHASE 3 CACHE BUST: append ?v=<timestamp> to defeat browser logo cache
      // after an upload. Only append to http(s) URLs; local blob:// previews
      // are left as-is.
      const bustedLogo = companyLogoUrl && companyLogoUrl.startsWith('http')
        ? (companyLogoUrl.includes('?v=')
            ? companyLogoUrl.replace(/\?v=\d+/, '?v=' + Date.now())
            : companyLogoUrl + '?v=' + Date.now())
        : companyLogoUrl;

      this.profileImage = bustedLogo;
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

  isAddressFormValid(status: boolean) {
    this.addressFormValid = status;
  }

  redirectToPreview() {
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
    if (event == 'created') {
      const create = this.dialog.open(UpdatedDialogComponent, {
        disableClose: false,
        data: 'Company successfully setup. You can now access other features',
      });

      create.afterClosed().subscribe(
        () => this.router.navigate(['../details'], { relativeTo: this.route })
      );
    } else if (event == 'updated') {
      // PHASE 3 DATA SYNC FIX: on successful update, re-read the latest
      // company from the NgRx store (it was just set by updateCompanySuccess)
      // and refresh localStorage so logo + name propagate to sidebar/topbar.
      if (this.company) {
        this.updateLocalStorage();
      }
      this.snackbarService.success('Company profile updated — your latest details are now live.');
    }
  }

  updateLocalStorage() {
    const user = localStorage.getItem('user');
    localStorage.removeItem('user');
    // PHASE 3 DATA SYNC FIX: also persist companyLogoUrl so sidebar/topbar
    // pick up the new logo without requiring a full page reload.
    localStorage.setItem('user', JSON.stringify({
      ...JSON.parse(user),
      companyName: this.company.companyName,
      companyId: this.company.companyId,
      companyLogoUrl: this.company.companyLogoUrl || null
    }));

    this.updateCompany.emit({
      status: true,
      userId: JSON.parse(user)._id
    });
  }

  ngOnDestroy(): void {
    this.companyFacade.resetStateNotif();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
