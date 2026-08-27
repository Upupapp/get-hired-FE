import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { SnackbarService } from '@app-core/services/snackbar.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ApplicantFacade } from '@app-applicant/state/applicant.facade';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { LoadingComponent } from '@app-shared/components/loading/loading.component';
import { currencies } from '@app-shared/mock.data';
import { startWith, pairwise, debounceTime, distinctUntilChanged } from 'rxjs';
import * as Model from '../../applicant.model';

@Component({
  selector: 'app-profile-basic-info',
  templateUrl: './profile-basic-info.component.html',
  styleUrls: ['./profile-basic-info.component.scss'],
  animations: [mainAnimations]
})
export class ProfileBasicInfoComponent implements OnInit {
  @Input() user: any;
  @Output() submitBasicInfo: EventEmitter<any> = new EventEmitter();
  // BUGFIX: the parent wizard's "Next" button advanced to Step 2 the
  // instant it dispatched the save action, without waiting for the actual
  // HTTP response -- by the time the backend replied (success OR failure),
  // this component was already destroyed (stepper flips via *ngIf) and its
  // success$/error$ subscriptions torn down in ngOnDestroy(), so neither
  // outcome was ever seen: a successful save showed no confirmation, and a
  // FAILED save (network hiccup, backend validation, session hiccup) was
  // completely silent -- the user was already on Step 2 with Short Bio (and
  // everything else on this step) never actually persisted. This output
  // lets the parent gate navigation on the real outcome instead of firing
  // it blind.
  @Output() saveResult: EventEmitter<'success' | 'error'> = new EventEmitter();

  photo: string;

  profileDetailsForm: FormGroup;
  profileImage: any;
  salaryCurrencies = currencies;
  applicantProfileId: string;
  private submitting = false;

  loading$ = this.applicantFacade.loading$
    .pipe().subscribe(this.formLoading.bind(this));

  details$ = this.applicantFacade.applicantDetails$
    .pipe().subscribe(this.fillUpForm.bind(this))

  workSetup$ = this.applicantFacade.setup$;
  typeList$ = this.applicantFacade.typeList$;
  level$ = this.applicantFacade.level$;
  success$ = this.applicantFacade.success$
    .pipe().subscribe(this.afterSubmit.bind(this))

  // BUGFIX: this component never listened for a save failure at all --
  // saveApplicantBasicProfileFail reached the store but nothing here
  // reacted to it, so a failed save (and everything the user typed,
  // including Short Bio) was lost with zero feedback.
  error$ = this.applicantFacade.error$
    .pipe().subscribe(this.onSaveError.bind(this))

  constructor(
    private applicantFacade: ApplicantFacade,
    private fb: FormBuilder,
    private snackbarService: SnackbarService,
    private router: Router,
    private route: ActivatedRoute,
    private loadingDialog: MatDialog,
  ) { }

  ngOnInit(): void {
    if (this.user) {
      this.applicantFacade.getApplicantById(this.user._id);
      this.formInitialized();
    }

    this.applicantFacade.getType();
    this.applicantFacade.getLevel();
    this.applicantFacade.getSetup();


    // this.profileDetailsForm.valueChanges
    // .pipe(startWith(''), pairwise(), debounceTime(1000))
    // .subscribe(([prev, cur]) => {
    //   console.log(prev);
    //   console.log(cur)
    // })

    this.profileDetailsForm.statusChanges.pipe(distinctUntilChanged()).subscribe((status) => {
      this.submitBasicInfo.emit(status);
    });
  }

  formInitialized() {
    this.profileDetailsForm = this.fb.group({
      photoUrl: [null],
      profileImage: [],
      jobTitle: [null, Validators.required],
      shortBio: [null, Validators.required],
      servicesProvided: [null],
      jobTypeId: [null, Validators.required],
      jobLevelId: [null, Validators.required],
      workSetupId: [null, Validators.required],
      salaryMinimum: [null, Validators.required],
      salaryMaximum: [null, Validators.required],
      salaryCurrency: [null, Validators.required],
      firstName: [this.user ? this.user.firstName : this.user.firstName, Validators.required],
      lastName: [this.user ? this.user.lastName : this.user.lastName, Validators.required],
      address: [null],
      contactNumber: [null, Validators.required],
      city: [null, Validators.required],
      country: [null, Validators.required]
    });

  }

  fillUpForm(data) {
    if (data && this.user) {
      this.applicantProfileId = data.applicantProfileId;

      this.formInitialized();

      if (this.profileDetailsForm) {
        this.photo = data.photoUrl;

        this.profileDetailsForm.get('photoUrl').setValue(data.photoUrl);
        this.profileDetailsForm.get('jobTitle').setValue(data.jobTitle);
        this.profileDetailsForm.get('shortBio').setValue(data.shortBio);
        this.profileDetailsForm.get('servicesProvided').setValue(data.servicesProvided);
        this.profileDetailsForm.get('jobTypeId').setValue(data.jobTypeId);
        this.profileDetailsForm.get('jobLevelId').setValue(data.jobLevelId);
        this.profileDetailsForm.get('workSetupId').setValue(data.workSetupId);
        this.profileDetailsForm.get('salaryMinimum').setValue(data.salaryMinimum);
        this.profileDetailsForm.get('salaryMaximum').setValue(data.salaryMaximum);
        this.profileDetailsForm.get('salaryCurrency').setValue(data.salaryCurrency);
        this.profileDetailsForm.get('firstName').setValue(data.firstName);
        this.profileDetailsForm.get('lastName').setValue(data.lastName);
        this.profileDetailsForm.get('address').setValue(data.address);
        this.profileDetailsForm.get('contactNumber').setValue(data.contactNumber);
        this.profileDetailsForm.get('city').setValue(data.city);
        this.profileDetailsForm.get('country').setValue(data.country);

      }
    }
  }

  onAvatarUploaded(result: any): void {
    this.photo = result.primaryUrl;
    this.profileImage = null;
    this.profileDetailsForm.get('photoUrl').setValue(result.primaryUrl);
  }

  onAvatarClear(): void {
    this.photo = null;
    this.profileImage = null;
    this.profileDetailsForm.get('photoUrl').setValue(null);
  }

  submitForm() {
    if (this.profileDetailsForm.valid) {
      this.submitting = true;
      const applicant = this.profileDetailsForm.value;

      const isProfileReady = applicant.firstName != ""
        && applicant.lastName != ""
        && (applicant.photoUrl != null && applicant.photoUrl != '')
        && applicant.jobTitle != ""
        && applicant.email != ""
        && applicant.contactNumber != ""
        && applicant.shortBio != ""
        && applicant.salaryCurrency != null
        && applicant.salaryMinimum != 0
        && applicant.salaryMaximum != 0;

      const basicInfo: Model.BasicProfileInfo = {
        ...applicant,
        userId: this.user._id,
        applicantProfileId: this.applicantProfileId,
        isProfileReady,
      }

      console.log(basicInfo);
      this.applicantFacade.saveBasicInfo(basicInfo);
    } else {
      // BUGFIX: previously a silent no-op -- the parent's "Next" button
      // is disabled while invalid so this path wasn't reachable from
      // there, but saveProgress() also calls submitForm() directly (via
      // the stepper's own step-change confirmation), which has no such
      // guard. Mark every field touched so validation messages actually
      // render, and tell the user why nothing was saved instead of
      // leaving them to guess.
      this.profileDetailsForm.markAllAsTouched();
      this.snackbarService.error('Please complete all required fields before continuing.', '');
      this.saveResult.emit('error');
    }
  }

  /**
   * BUGFIX: the 'created' branch (fires on the applicant's very first save
   * -- i.e. exactly when someone is entering Short Bio etc. for the first
   * time on a brand-new profile) navigated to /recruiter/jobs/list -- a
   * copy-paste leftover from the EMPLOYER onboarding flow, wrong role
   * entirely for this applicant-only component. AuthGuard immediately
   * bounced the applicant back out since they don't have the '2' (employer)
   * role, which looked to the user like their save had failed or their data
   * had vanished, even though the save itself succeeded and persisted
   * correctly. Both branches now behave the same way as the already-correct
   * 'updated' branch: show a success toast and let the parent wizard
   * (profile-forms.component.ts, already listening for this same event)
   * advance to the next step on its own -- no navigation from here.
   */
  afterSubmit(event) {
    if (event == 'created') {
      this.submitting = false;
      this.snackbarService.success(`Your profile has been created`, '');
      this.submitBasicInfo.emit('VALID');
      this.saveResult.emit('success');
    } else if (event == 'updated') {
      this.submitting = false;
      this.snackbarService.success(`Profile successfully updated`, '');
      this.submitBasicInfo.emit('VALID');
      this.saveResult.emit('success');
    }
  }

  // BUGFIX: previously nothing in this component reacted to a save
  // failure at all. this.submitting distinguishes a real failed save
  // from state.error being set by an unrelated action elsewhere in this
  // reducer's shared error field (see saveApplicantBasicProfileFail and
  // its siblings), and from the stale leftover value of a much earlier,
  // already-handled failure.
  onSaveError(err: any): void {
    if (err && this.submitting) {
      this.submitting = false;
      this.snackbarService.error(
        typeof err === 'string' ? err : 'We couldn\'t save your profile. Please try again.',
        ''
      );
      this.saveResult.emit('error');
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
    } else {
      setTimeout(() => this.loadingDialog.closeAll(), 3000);
    }
  }

  get country_validators() {
    return this.profileDetailsForm.get('country');
  }

  get city_validators() {
    return this.profileDetailsForm.get('city');
  }

  get contactNumber_validators() {
    return this.profileDetailsForm.get('contactNumber');
  }

  get salaryCurrency_validators() {
    return this.profileDetailsForm.get('salaryCurrency');
  }

  get salaryMaximum_validators() {
    return this.profileDetailsForm.get('salaryMaximum');
  }

  get salaryMinimum_validators() {
    return this.profileDetailsForm.get('salaryMinimum');
  }

  get workSetupId_validators() {
    return this.profileDetailsForm.get('workSetupId');
  }

  get jobLevelId_validators() {
    return this.profileDetailsForm.get('jobLevelId');
  }

  get jobTypeId_validators() {
    return this.profileDetailsForm.get('jobTypeId');
  }

  get shortBio_validators() {
    return this.profileDetailsForm.get('shortBio');
  }

  get jobTitle_validators() {
    return this.profileDetailsForm.get('jobTitle');
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if (this.success$) {
      this.success$.unsubscribe();
    }

    if (this.error$) {
      this.error$.unsubscribe();
    }

    if(this.loading$) {
      this.formLoading(false);
      this.loading$.unsubscribe();
    }
  }

}
