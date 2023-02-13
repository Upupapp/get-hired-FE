import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { ApplicantFacade } from '../state/applicant.facade';
import * as Model from '../applicant.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoadingComponent } from '@app-shared/components/loading/loading.component';
import { MatDialog } from '@angular/material/dialog';
import { SuccessDialogComponent } from '@main/shared/components/success-dialog/success-dialog.component';
import { Subscription, Subject, takeUntil, distinctUntilChanged, of } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationDialogComponent } from '@app-shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-profile-form',
  templateUrl: './profile-form.component.html',
  styleUrls: ['./profile-form.component.scss'],
  animations: [mainAnimations]
})
export class ProfileFormComponent implements OnInit {
  public unsubscribe$ = new Subject<void>();
  @Input() user: any;

  profileForm: FormGroup;
  subscriptions$ = new Subscription();
  applicantId: string;
  applicant: Model.Applicant;
  loading: boolean = true;
  updateSuccess: boolean = false;

  asyncLocalStorage = {
    setItem: async function (key, value) {
      await Promise.resolve();
      localStorage.setItem(key, value);
    },
    getItem: async function (key) {
      await Promise.resolve();
      return localStorage.getItem(key);
    }
  };

  public stepperItems: any[] = [
    {
      id: 1,
      title: "Profile Details",
      formName: 'profileDetailsForm'

    },
    {
      id: 2,
      title: this.translate.instant('SKILLS_AND_EXPERIENCE.SKILLS_EXPERIENCE_SECTION'),
      disabled: false,
      formName: 'initialData'

    },
    {
      id: 3,
      title: this.translate.instant('DOCUMENT.DOCUMENTS_SECTION'),
      disabled: false,
      formName: ''
    },
  ];

  public stepper: number = 1;

  applicant$ = this.applicantFacade.applicantDetails$
    .pipe().subscribe(this.mappedApplicant.bind(this));

  loading$ = this.applicantFacade.loading$
    .pipe().subscribe(this.formLoading.bind(this));


  success$ = this.applicantFacade.success$
    .pipe().subscribe(this.afterSubmit.bind(this))

  constructor(
    private fb: FormBuilder,
    private applicantFacade: ApplicantFacade,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private successDialog: MatDialog,
    private loadingDialog: MatDialog,
    private translate: TranslateService,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    if (this.user) {
      this.applicantFacade.getApplicantById(this.user._id);

      if (sessionStorage.getItem('profile-update')) {
        this.stepper = parseInt(sessionStorage.getItem('profile-update'));
      }
    }

    this.initializedForm();
  }

  initializedForm(data?: Model.Applicant) {
    console.log(data);
    this.profileForm = this.fb.group({
      profileDetailsForm: this.fb.group({
        photoUrl: [data ? data.photoUrl : null],
        profileImage: [],
        jobTitle: [data ? data.jobTitle : null],
        shortBio: [data ? data.shortBio : null],
        servicesProvided: [data ? data.servicesProvided : null],
        jobTypeId: [data ? data.jobTypeId : null],
        jobLevelId: [data ? data.jobLevelId : null],
        workSetupId: [data ? data.workSetUpId : null],
        salaryMinimum: [data ? data.salaryMinimum : null],
        salaryMaximum: [data ? data.salaryMaximum : null],
        salaryCurrency: [data ? data.salaryCurrency : null],
        firstName: [data ? data.firstName : this.user.firstName, Validators.required],
        lastName: [data ? data.lastName : this.user.lastName, Validators.required],
        address: [data ? data.address : null],
        contactNumber: [data ? data.contactNumber : null, Validators.required],
        city: [data ? data.city : null, Validators.required],
        country: [data ? data.country : null, Validators.required]
      }),
      profileArraysForm: this.fb.group({
        workExperience:  [],
        educationalBackground:  [],
        professionalSkills:  [],
        certifications: [],
        skillsTxt: [null]
      }),
      // profileArraysForm: this.fb.group({
      //   workExperience: data ? data.workExperience : [],
      //   educationalBackground: data ? data.educationalBackground : [],
      //   professionalSkills: data ? data.skills : [],
      //   certifications: data ? data.certifications : [],
      //   skillsTxt: [null]
      // }),
      profileDocuments: this.fb.group({
        documents: this.fb.array([]),
        videoCVFile: [null],
        videoCVUrl: [null]
      })
    });

    this.subscriptions$.add(
      this.profileForm.controls.profileDetailsForm.statusChanges.pipe(distinctUntilChanged()).subscribe((status) => {
        this.stepperItems[1].disabled = status != 'VALID'

      }));

    // this.subscriptions$.add(
    //   this.profileForm.controls.profileArraysForm.valueChanges.pipe(distinctUntilChanged()).subscribe((value) => {
    //   }));
  }

  saveProgress(event: number) {
    console.log(this.stepper)
    console.log(event)

    if(this.stepper != event) {
      const ref = this.dialog.open(ConfirmationDialogComponent, {
        disableClose: true,
        data: {
          action: `Save Step ${this.stepper}`,
        },
      });

      ref
        .afterClosed()
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((result) => {
          if (result == 1) {
            // TODO
            this.changeStep(event);
          } else {
            // TODO on Cancel
          }
        });
    }

  }

  async submitProfile() {
    this.updateSuccess = true;

    // TODO save profile
    const applicant = await this.formatProfile();

    console.log(applicant);

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


    this.applicantFacade.saveApplicant({
      ...applicant,
      isProfileReady: isProfileReady
    })
  }

  mappedApplicant(data) {
    if (data) {
      this.applicant = data;
      this.applicantId = data.applicantProfileId;

      const user = localStorage.getItem('user');
      localStorage.removeItem('user');
      localStorage.setItem('user', JSON.stringify({
        ...JSON.parse(user),
        firstName: data.firstName,
        lastName: data.lastName,
        photoUrl: data.photoUrl
      }));

      this.profileForm.controls.profileDetailsForm.get('photoUrl').setValue(data.photoUrl);
      this.profileForm.controls.profileDetailsForm.get('jobTitle').setValue(data.jobTitle);
      this.profileForm.controls.profileDetailsForm.get('shortBio').setValue(data.shortBio);
      this.profileForm.controls.profileDetailsForm.get('servicesProvided').setValue(data.servicesProvided);
      this.profileForm.controls.profileDetailsForm.get('jobTypeId').setValue(data.jobTypeId);
      this.profileForm.controls.profileDetailsForm.get('jobLevelId').setValue(data.jobLevelId);
      this.profileForm.controls.profileDetailsForm.get('workSetupId').setValue(data.workSetupId);
      this.profileForm.controls.profileDetailsForm.get('salaryMinimum').setValue(data.salaryMinimum);
      this.profileForm.controls.profileDetailsForm.get('salaryMaximum').setValue(data.salaryMaximum);
      this.profileForm.controls.profileDetailsForm.get('firstName').setValue(data.firstName);
      this.profileForm.controls.profileDetailsForm.get('lastName').setValue(data.lastName);
      this.profileForm.controls.profileDetailsForm.get('address').setValue(data.address);
      this.profileForm.controls.profileDetailsForm.get('contactNumber').setValue(data.contactNumber);
      this.profileForm.controls.profileDetailsForm.get('city').setValue(data.city);
      this.profileForm.controls.profileDetailsForm.get('country').setValue(data.country);
      this.profileForm.controls.profileDetailsForm.get('salaryCurrency').setValue(data.salaryCurrency);
      this.profileForm.controls.profileDocuments.get('videoCVUrl').setValue(data.videoCVUrl);
      this.profileForm.controls.profileArraysForm.get('workExperience').setValue(data.workExperience);
      this.profileForm.controls.profileArraysForm.get('professionalSkills').setValue(data.skills);
      this.profileForm.controls.profileArraysForm.get('educationalBackground').setValue(data.educationalBackground);
      this.profileForm.controls.profileArraysForm.get('certifications').setValue(data.certifications);


      let docs = this.formatDocToFileGroup(data.documents);
      this.docArray.controls = docs;
      this.docArray.patchValue(docs);
    }

  }

  get docArray() {
    return this.profileForm.controls.profileDocuments.get('documents') as FormArray;
  }

  formatDocToFileGroup(rawDocs) {
    const formArraysDoc = rawDocs.map(item => {
      const filegroup = this.fb.group({
        file: new FormControl(item.file),
        filename: new FormControl(item.filename),
        size: new FormControl(item.size),
        type: new FormControl(item.type),
        fileurl: new FormControl(item.fileurl),
        created_at: new FormControl(item.created_at)
      });
      return filegroup;
    });
    return formArraysDoc
  }

  async formatProfile(): Promise<Model.Applicant> {
    const user = await this.asyncLocalStorage.getItem('user');
    let { profileDetailsForm, profileArraysForm, profileDocuments } = this.profileForm.controls;

    let data = {
      ...profileArraysForm.value
    }

    let filteredWork = data?.workExperience && data?.workExperience.length != 0 ? data?.workExperience.filter(item => item.jobTitle): [];
    let filteredCert = data?.certifications && data?.certifications.length != 0 ? data?.certifications.filter(item => item.certTitle):[];
    let filteredEduc = data?.educationalBackground && data?.educationalBackground.length != 0 ? data?.educationalBackground.filter(item => item.school):[];

    let fileteredProfileArray = {
      workExperience: filteredWork,
      certifications: filteredCert,
      educationalBackground: filteredEduc,
      skillsTxt: data.skillsTxt,
      skills: data.professionalSkills
    }

    return {
      ...profileDetailsForm.value,
      ...fileteredProfileArray,
      ...profileDocuments.value,
      userId: JSON.parse(user)._id,
      email: JSON.parse(user).email,
      applicantProfileId: this.applicantId
    }
  }

  changeStep(event: number) {
    this.stepper = event;
    const formCtrl = this.stepperItems[event - 2]?.formName;

    switch (formCtrl) {
      case 'profileDetailsForm':
        const bodyInitial = this.profileForm.controls[formCtrl].value;
        this.applicantFacade.setInitialForm(bodyInitial);
        break;
      case 'profileArraysForm':
        const bodyInfo = this.profileForm.controls[formCtrl].value;
        this.applicantFacade.setAdditionalInfo(bodyInfo);
        break;
      // case 'profileDocuments':
      //   const bodyDocu = this.profileForm.controls[formCtrl] as FormArray;
      //   let docs = [];
      //   console.log()
      //   bodyDocu.controls['documents'].forEach(ctrl => {
      //     docs.push(ctrl.value)
      //   });
      //   this.applicantFacade.setProfileDocu({
      //     documents: docs,
      //     videoCVUrl: bodyDocu.controls['videoCVUrl'].value
      //   });
      //   break;
    }
  }

  afterSubmit(event) {
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

      // this.loadingDialog.closeAll();
      // this.showSuccessDialog();
    } else if (event == 'saveStepperForm') {
      this.submitProfile();
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
      this.loading = loading;
      setTimeout(() => this.loadingDialog.closeAll(), 3000);

      // dont close automatically all modal
      // if (!this.updateSuccess) {
      //   setTimeout(() => this.loadingDialog.closeAll(), 3000);
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
          subtitle: 'Successfully updated profile details'
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

  redirectToProfile() {
    this.router.navigateByUrl('user/profile/details');
  }

  ngOnDestroy(): void {
    if (this.subscriptions$) {
      this.subscriptions$.unsubscribe();
    }
    sessionStorage.removeItem('profile-update')
    if (this.success$) {
      this.success$.unsubscribe();
    }
  }

}
