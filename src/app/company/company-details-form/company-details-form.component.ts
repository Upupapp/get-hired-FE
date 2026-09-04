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
import { takeUntil, filter } from 'rxjs/operators';
import { UpdatedDialogComponent } from '@app-shared/components/updated-dialog/updated-dialog.component';
import { GhFeedbackModalComponent, FeedbackModalData } from './gh-feedback-modal/gh-feedback-modal.component';
import { HapticFeedbackService } from '@app-shared/services/haptic-feedback/haptic-feedback.service';

// Human-readable labels for changed-field chips in the success modal
const FIELD_LABELS: { [key: string]: string } = {
  companyName: 'Company name',
  companyEmail: 'Contact email',
  companyContactNumber: 'Work phone',
  companyAddress: 'Address',
  companyCity: 'City',
  companyCountry: 'Country',
  companyDetails: 'About',
  industryId: 'Industry',
  workSetupId: 'Work setup',
  numberOfEmployee: 'Team size',
  companyLogoFile: 'Company logo',
  shownPublicly: 'Public visibility',
};

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
  rawAddress: any;
  loading: boolean = false;
  saving: boolean = false;          // true while PUT request is in-flight
  addressFormValid: boolean = false;

  // Snapshot of company data at load time — used to compute changedFields
  private companySnapshot: any = {};

  workSetup$ = this.companyFacade.setup$;
  industry$ = this.companyFacade.industry$;

  constructor(
    private formBuilder: FormBuilder,
    private companyFacade: CompanyFacade,
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private snackbarService: SnackbarService,
    private haptic: HapticFeedbackService,
  ) { }

  ngOnInit(): void {
    this.companyFacade.getCompany();
    this.companyFacade.getIndustry();
    this.companyFacade.getSetup();

    this.companyDetailsForm = this.formBuilder.group({
      companyEmail:         ['', [Validators.required, Validators.email]],
      companyContactNumber: [''],
      companyAddress:       [null],
      companyCity:          [''],
      companyCountry:       [''],
      companyLogoUrl:       [''],
      companyName:          ['', [Validators.required]],
      companyDetails:       [''],
      industryId:           [null],
      workSetupId:          [null],
      numberOfEmployee:     [0],
      companyLogoFile:      [],
      companyState:         [],
      companyAddressOne:    [],
      companyTown:          [],
      companyZip:           [],
      companyMapUrl:        [],
      shownPublicly:        []
    });

    // Drive skeleton from data arrival; shared loading$ also covers
    // getSetup/getIndustry/getSubscription and would leave the form stuck.
    this.loading = true;
    this.companyFacade.companyDetails$
      .pipe(takeUntil(this.destroy$))
      .subscribe(company => {
        this.setCompany(company as EmployeeCompany);
        this.loading = false;
      });

    // Success path — open branded success modal
    // filter(!!event) guards against the empty-string initial store emission
    this.companyFacade.success$
      .pipe(takeUntil(this.destroy$), filter(event => !!event))
      .subscribe(event => this.afterSubmit(event));

    // Error path — open branded error/validation modal
    this.companyFacade.error$
      .pipe(takeUntil(this.destroy$), filter(err => !!err))
      .subscribe(err => this.afterError(err));
  }

  setCompany(company: EmployeeCompany) {
    if (company && company.companyId != null) {
      this.company = company;
      const {
        companyName, companyEmail, companyContactNumber,
        companyAddress, companyCity, companyCountry,
        companyState, companyTown, companyZip,
        companyMapUrl, companyAddressOne, companyLogoUrl,
        companyDetails, industryId, workSetupId,
        numberOfEmployee, shownPublicly
      } = company;

      this.companyDetailsForm.patchValue({
        companyName, companyEmail, companyContactNumber,
        companyAddress, companyCity, companyCountry,
        companyDetails, industryId, workSetupId,
        numberOfEmployee, companyLogoUrl, shownPublicly,
      });

      // PHASE 3 CACHE BUST: append ?v=<timestamp> to defeat browser logo cache
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
      };

      // Snapshot for changed-field computation at submit time
      this.companySnapshot = {
        companyName, companyEmail, companyContactNumber,
        companyAddress, companyCity, companyCountry,
        companyDetails, industryId, workSetupId,
        numberOfEmployee, shownPublicly
      };

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

  redirectToPreview() {}

  onUpload(file: any) {
    this.profileImage = file.file;
    this.companyDetailsForm.controls['companyLogoFile'].setValue(this.profileImage);
  }

  // IMAGE-CONSISTENCY FIX: app-gh-image-upload exposes `uploading` (see its
  // own doc comment) specifically so a consumer can block Save while a
  // logo upload is still in flight -- this form never bound it, so
  // clicking Save right after picking a new logo (the local preview
  // appears instantly, looks done) submitted with the OLD companyLogoUrl,
  // silently dropping the new logo from that save. Same bug class/fix as
  // job-create's bannerUploadPending.
  logoUploadPending = false;

  onLogoUploading(pending: boolean): void {
    this.logoUploadPending = pending;
  }

  onLogoUploaded(result: any) {
    this.profileImage = result.primaryUrl;
    // Store the already-uploaded URL so the save form skips re-uploading
    this.companyDetailsForm.controls['companyLogoFile'].setValue(null);
    // Patch the existing logo URL field so the backend uses the pre-uploaded image
    if (this.companyDetailsForm.controls['companyLogoUrl']) {
      this.companyDetailsForm.controls['companyLogoUrl'].setValue(result.primaryUrl);
    }
  }

  onLogoClear() {
    this.profileImage = null;
    this.companyDetailsForm.controls['companyLogoFile'].setValue(null);
  }

  onSubmit() {
    // Double-submit guard: ignore while a request is in-flight
    if (this.saving) { return; }
    // IMAGE-CONSISTENCY FIX: also ignore while a logo upload is still in
    // flight -- see onLogoUploading() above. The Save button is already
    // disabled for this case in the template; this is the defensive
    // second guard for (ngSubmit) firing via other means (e.g. Enter key).
    if (this.logoUploadPending) { return; }

    // Mark all fields touched to surface inline validation errors
    Object.values(this.companyDetailsForm.controls).forEach(c => c.markAsTouched());

    if (!this.companyDetailsForm.valid) {
      // If FE validation fails, focus the first invalid field
      this.focusFirstInvalidField();
      return;
    }

    // FE size guard: base64 data URLs are ~1.37× the raw file size.
    // 4 MB of base64 ≈ 2.9 MB image — well under the 6 MB server limit.
    const logoVal = this.companyDetailsForm.controls['companyLogoFile'].value;
    if (logoVal && typeof logoVal === 'string' && logoVal.length > 4 * 1024 * 1024) {
      this.haptic.warning();
      this.dialog.open(GhFeedbackModalComponent, {
        panelClass: 'gh-feedback-modal-panel',
        disableClose: false,
        autoFocus: false,
        data: {
          state: 'error',
          title: 'Logo file is too large',
          body: 'The image you selected exceeds 3 MB. Try compressing it or choosing a smaller file before uploading.',
          primaryCta: 'Choose another file',
        } as FeedbackModalData,
      });
      return;
    }

    if (this.company && this.company.companyId) {
      this.saving = true;
      this.haptic.press();
      this.companyFacade.resetStateNotif();  // clear stale error before new attempt

      this.companyFacade.updateCompany({
        ...this.companyDetailsForm.value,
        companyId: this.company.companyId,
        workSetupId: parseInt(this.companyDetailsForm.controls.workSetupId.value),
        industryId:  parseInt(this.companyDetailsForm.controls.industryId.value),
      });
    } else {
      this.companyFacade.createCompany({
        ...this.companyDetailsForm.value,
        workSetupId: parseInt(this.companyDetailsForm.controls.workSetupId.value),
        industryId:  parseInt(this.companyDetailsForm.controls.industryId.value),
      });
    }
  }

  afterSubmit(event) {
    if (event === 'created') {
      const create = this.dialog.open(UpdatedDialogComponent, {
        disableClose: false,
        data: 'Company successfully setup. You can now access other features',
      });
      // PRODUCT CHANGE: a new Employer's FIRST-EVER company setup (this
      // 'created' branch only -- never 'updated', a later edit) now flows
      // straight into AI Create afterward, exactly like an already-onboarded
      // Employer clicking "Create a Job" -- see EmployerPanelComponent's
      // openAiCreate query param handling, which calls the very same
      // goToCreateJob() the dashboard button uses. Only the extra Business
      // Setup step in front of it differs from the existing-Employer flow.
      create.afterClosed().subscribe(
        () => this.router.navigate(['/recruiter/dashboard'], { queryParams: { openAiCreate: '1' } })
      );
    } else if (event === 'updated') {
      this.saving = false;
      this.haptic.success();

      if (this.company) { this.updateLocalStorage(); }
      this.companyDetailsForm.markAsPristine();

      const changedFields = this.computeChangedFields();
      const modalRef = this.dialog.open(GhFeedbackModalComponent, {
        panelClass: 'gh-feedback-modal-panel',
        disableClose: false,
        autoFocus: false,
        data: {
          state: 'success',
          title: 'Company profile updated',
          body: 'Your company details are saved and ready for your hiring workspace.',
          syncNote: 'Changes synced across your recruiter dashboard and company profile.',
          changedFields,
          primaryCta: 'Continue editing',
          secondaryCta: 'Back to dashboard',
          autoDismissMs: 4000,
        } as FeedbackModalData,
      });

      modalRef.afterClosed().subscribe(action => {
        if (action === 'secondary') {
          this.router.navigate(['/recruiter/dashboard']);
        }
      });
    }
  }

  afterError(err: any) {
    this.saving = false;

    // Normalise: err can be a string (legacy) or the full BE error body object
    const errObj = (err && typeof err === 'object') ? err : { error: err };
    const feedbackState = (errObj.feedback && errObj.feedback.state) || 'error';

    // Validation error from BE — show field errors in modal
    if (feedbackState === 'validation_error' || (errObj.fieldErrors && Object.keys(errObj.fieldErrors).length)) {
      this.haptic.warning();
      const fieldErrors = errObj.fieldErrors
        ? Object.entries(errObj.fieldErrors).map(([field, message]) => ({
            field: FIELD_LABELS[field] || field,
            message: message as string,
          }))
        : [];

      this.dialog.open(GhFeedbackModalComponent, {
        panelClass: 'gh-feedback-modal-panel',
        disableClose: false,
        autoFocus: false,
        data: {
          state: 'validation',
          title: 'Some details need a quick check',
          body: 'We found fields that need to be fixed before saving.',
          fieldErrors,
          primaryCta: 'Review fields',
        } as FeedbackModalData,
      }).afterClosed().subscribe(() => this.focusFirstInvalidField());

      return;
    }

    // File too large — server rejected the payload (413)
    if (errObj.httpStatus === 413) {
      this.haptic.error();
      this.dialog.open(GhFeedbackModalComponent, {
        panelClass: 'gh-feedback-modal-panel',
        disableClose: false,
        autoFocus: false,
        data: {
          state: 'error',
          title: 'File too large',
          body: 'The logo image exceeds the maximum upload size. Please use a file under 4 MB, or compress it and try again.',
          primaryCta: 'Choose another file',
          secondaryCta: 'Save without logo',
        } as FeedbackModalData,
      }).afterClosed().subscribe(action => {
        if (action === 'secondary') {
          this.companyDetailsForm.controls['companyLogoFile'].setValue(null);
          this.onSubmit();
        }
      });
      return;
    }

    // Network error (httpStatus is attached by the NgRx effect)
    if (errObj.httpStatus === 0) {
      this.haptic.error();
      this.dialog.open(GhFeedbackModalComponent, {
        panelClass: 'gh-feedback-modal-panel',
        disableClose: false,
        autoFocus: false,
        data: {
          state: 'network',
          title: 'Connection paused',
          body: "We couldn’t reach GetHired. Your edits are still on this page.",
          primaryCta: 'Try again',
          secondaryCta: 'Keep editing',
        } as FeedbackModalData,
      }).afterClosed().subscribe(action => {
        if (action === 'primary') { this.onSubmit(); }
      });
      return;
    }

    // Permission / BOLA error
    if (errObj.httpStatus === 403 || errObj.httpStatus === 401) {
      this.haptic.error();
      this.dialog.open(GhFeedbackModalComponent, {
        panelClass: 'gh-feedback-modal-panel',
        disableClose: false,
        autoFocus: false,
        data: {
          state: 'permission',
          title: "We couldn’t update this company profile",
          body: 'This account does not have permission to update these company settings.',
          primaryCta: 'Back to company page',
        } as FeedbackModalData,
      }).afterClosed().subscribe(() => {
        this.router.navigate(['/recruiter/company/details']);
      });
      return;
    }

    // Generic server error
    this.haptic.error();
    this.dialog.open(GhFeedbackModalComponent, {
      panelClass: 'gh-feedback-modal-panel',
      disableClose: false,
      autoFocus: false,
      data: {
        state: 'error',
        title: "Changes weren’t saved",
        body: 'Your edits are still here. Please try again in a moment.',
        primaryCta: 'Try again',
        secondaryCta: 'Keep editing',
      } as FeedbackModalData,
    }).afterClosed().subscribe(action => {
      if (action === 'primary') { this.onSubmit(); }
    });
  }

  // Compute which form fields changed relative to the loaded snapshot
  private computeChangedFields(): string[] {
    const changed: string[] = [];
    const val = this.companyDetailsForm.value;

    if (this.companyDetailsForm.controls['companyLogoFile'].value) {
      changed.push('Company logo');
    }

    const comparableFields = [
      'companyName', 'companyEmail', 'companyContactNumber',
      'companyAddress', 'companyCity', 'companyCountry',
      'companyDetails', 'industryId', 'workSetupId',
      'numberOfEmployee', 'shownPublicly',
    ];

    for (const key of comparableFields) {
      const snap = (this.companySnapshot as any)[key];
      const cur  = val[key];
      if (String(snap || '') !== String(cur || '')) {
        const label = FIELD_LABELS[key];
        if (label && !changed.includes(label)) { changed.push(label); }
      }
    }

    return changed;
  }

  // Focus the first form field with a validation error
  private focusFirstInvalidField(): void {
    const fieldOrder = [
      'companyName', 'companyEmail', 'companyContactNumber',
      'numberOfEmployee', 'companyAddress',
    ];
    for (const name of fieldOrder) {
      const ctrl = this.companyDetailsForm.get(name);
      if (ctrl && ctrl.invalid) {
        const el = document.querySelector(`[formControlName="${name}"]`) as HTMLElement;
        if (el) { el.focus(); }
        return;
      }
    }
  }

  updateLocalStorage() {
    const user = localStorage.getItem('user');
    localStorage.removeItem('user');
    localStorage.setItem('user', JSON.stringify({
      ...JSON.parse(user),
      companyName:   this.company.companyName,
      companyId:     this.company.companyId,
      companyLogoUrl: this.company.companyLogoUrl || null
    }));
    this.updateCompany.emit({
      status: true,
      userId: JSON.parse(localStorage.getItem('user'))._id
    });
  }

  ngOnDestroy(): void {
    this.companyFacade.resetStateNotif();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
