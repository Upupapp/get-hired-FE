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
      title: "Skills and Experience",
      disabled: false,
      formName: 'initialData'

    },
    {
      id: 3,
      title: "Documents",
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
    private loadingDialog: MatDialog
  ) { }

  ngOnInit(): void {
    console.log(this.user);
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
        firstName: [data ? data.firstName : this.user.firstName, Validators.required],
        lastName: [data ? data.lastName : this.user.lastName, Validators.required],
        address: [data ? data.address : null],
        contactNumber: [data ? data.contactNumber : null, Validators.required],
        city: [data ? data.city : null, Validators.required],
        country: [data ? data.country : null, Validators.required]
      }),
      profileArraysForm: this.fb.group({
        workExperience: this.fb.array([]),
        educationalBackground: this.fb.array([]),
        professionalSkills: this.fb.array([]),
        certifications: this.fb.array([]),
        skillsTxt: [null]
      }),
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

    this.subscriptions$.add(
      this.profileForm.controls.profileArraysForm.valueChanges.pipe(distinctUntilChanged()).subscribe((value) => {
        console.log(value);

      }));
  }

  async submitProfile() {
    this.updateSuccess = true;

    // TODO save profile
    const applicant = await this.formatProfile();

    const isProfileReady = applicant.firstName != ""
      && applicant.lastName != ""
      && applicant.profileImage
      && applicant.jobTitle != ""
      && applicant.email != ""
      && applicant.contactNumber != ""
      && applicant.shortBio != ""
      && applicant.salaryMinimum != 0
      && applicant.salaryMaximum != 0;

    console.log(applicant);
    console.log(isProfileReady);

    this.applicantFacade.saveApplicant({
      ...applicant,
      isProfileReady: isProfileReady
    })
  }

  mappedApplicant(data) {
    if (data) {
      console.log(data);
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

      this.profileForm.controls.profileDocuments.get('videoCVUrl').setValue(data.videoCVUrl);

      const docs = this.profileForm.controls.profileDocuments.get('documents') as FormArray;
      data.documents.map(item => {
        const fileGroup = this.fb.group({
          file: new FormControl(item.file),
          filename: new FormControl(item.filename),
          size: new FormControl(item.size),
          type: new FormControl(item.type),
          fileurl: new FormControl(item.fileurl),
          created_at: new FormControl(item.created_at)
        })
        docs.push(fileGroup);
      });

      const works = this.profileForm.controls.profileArraysForm.get('workExperience') as FormArray;
      data.workExperience.map((item: Model.WorkExperience) => {
        const fileGroup = this.fb.group({
          createdAt: new FormControl(item.createdAt),
          updatedAt: new FormControl(item.updatedAt),
          jobTitle: new FormControl(item.jobTitle),
          companyName: new FormControl(item.companyName),
          location: new FormControl(item.location),
          jobTypeId: new FormControl(item.jobTypeId),
          jobTypeName: new FormControl(item.jobTypeName),
          startMonth: new FormControl(item.startMonth),
          startYear: new FormControl(item.startYear),
          endMonth: new FormControl(item.endMonth),
          endYear: new FormControl(item.endYear),
          isCurrentJob: new FormControl(item.isCurrentJob),
          details: new FormControl(item.details),
        })
        works.push(fileGroup);
      });
    }

  }

  async formatProfile(): Promise<Model.Applicant> {
    const user = await this.asyncLocalStorage.getItem('user');
    let { profileDetailsForm, profileArraysForm, profileDocuments } = this.profileForm.controls;

    let data = {
      ...profileArraysForm.value
    }

    let filteredWork = data?.workExperience.filter(item => item.jobTitle)
    let filteredCert = data?.certifications.filter(item => item.certTitle)
    let filteredEduc = data?.educationalBackground.filter(item => item.school)

    let fileteredProfileArray = {
      workExperience: filteredWork,
      certifications: filteredCert,
      educationalBackground: filteredEduc,
      skillsTxt: data.skillsTxt,
      professionalSkills: data.professionalSkills
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
        this.applicantFacade.setAdditionalInfo(bodyInitial);
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
      console.log('HALA')
      this.snackBar.open(`Profile successfully updated`, '', {
        duration: 4000,
        panelClass: ['success-snackbar'],
        verticalPosition: 'top',
        horizontalPosition: 'right'
      });

      // this.loadingDialog.closeAll();
      // this.showSuccessDialog();
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
