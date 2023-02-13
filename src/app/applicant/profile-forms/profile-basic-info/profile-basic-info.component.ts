import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
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

  photo: string;

  profileDetailsForm: FormGroup;
  profileImage: any;
  salaryCurrencies = currencies;
  applicantProfileId: string;

  loading$ = this.applicantFacade.loading$
    .pipe().subscribe(this.formLoading.bind(this));

  details$ = this.applicantFacade.applicantDetails$
    .pipe().subscribe(this.fillUpForm.bind(this))

  workSetup$ = this.applicantFacade.setup$;
  typeList$ = this.applicantFacade.typeList$;
  level$ = this.applicantFacade.level$;
  success$ = this.applicantFacade.success$
    .pipe().subscribe(this.afterSubmit.bind(this))

  constructor(
    private applicantFacade: ApplicantFacade,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
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

  onUpload(item: any) {
    this.profileImage = item;
    this.profileDetailsForm.controls['profileImage'].setValue(item.file)
  }

  submitForm() {
    if (this.profileDetailsForm.valid) {
      const applicant = this.profileDetailsForm.value;

      const isProfileReady = applicant.firstName != ""
        && applicant.lastName != ""
        && applicant.profileImage
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
    }
  }

  afterSubmit(event) {
    console.log('who called');
    if (event == 'created') {
      this.snackBar.open(`Your public profile has been created`, '', {
        duration: 4000,
        panelClass: ['success-snackbar'],
      });
      this.router.navigate(['/recruiter/jobs/list'], { relativeTo: this.route });
    } else if (event == 'updated') {
      this.snackBar.open(`Profile successfully updated`, '', {
        duration: 4000,
        panelClass: ['success-snackbar'],
        verticalPosition: 'top',
        horizontalPosition: 'right'
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

    if(this.loading$) {
      this.loading$.unsubscribe();
    }
  }

}
