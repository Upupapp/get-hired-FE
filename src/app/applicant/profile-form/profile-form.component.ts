import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { distinctUntilChanged, of, Subscription } from 'rxjs';
import { ApplicantFacade } from '../state/applicant.facade';
import * as Model from '../applicant.model';

@Component({
  selector: 'app-profile-form',
  templateUrl: './profile-form.component.html',
  styleUrls: ['./profile-form.component.scss'],
  animations: [mainAnimations]
})
export class ProfileFormComponent implements OnInit {
  profileForm: FormGroup;
  subscriptions$ = new Subscription();
  applicantId: string;

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
      disabled: true,
      formName: ''
    },
  ];

  public stepper: number = 1;

  constructor(
    private fb: FormBuilder,
    private applicantFacade: ApplicantFacade,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.initializedForm();
  }

  initializedForm() {
    const user = JSON.parse(localStorage.getItem('user'));

    this.profileForm = this.fb.group({
      profileDetailsForm: this.fb.group({
        photoUrl: [null],
        profileImage: new FormArray([]),
        jobTitle: [null],
        shortBio: [null],
        servicesProvided: [null],
        jobTypeId: [null],
        jobLevelId: [null],
        workSetupId: [null],
        salaryMinimum: [null],
        salaryMaximum: [null],
        firstName: [user.firstName, Validators.required],
        lastName: [user.lastName, Validators.required],
        address: [null],
        contactNumber: [null, Validators.required],
        city: [null, Validators.required],
        country: [null, Validators.required]
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
    // TODO save profile
    const applicant = await this.formatProfile();

    const isProfileReady = applicant.firstName != ""
      && applicant.lastName != ""
      && applicant.profileImage[0]
      && applicant.jobTitle != ""
      && applicant.email != ""
      && applicant.contactNumber != ""
      && applicant.shortBio != ""
      && applicant.salaryMinimum != 0
      && applicant.salaryMaximum != 0;

      console.log(applicant);
      console.log(isProfileReady);

      // this.applicantFacade.createApplicant({
      //   ...applicant,
      //   isProfileReady
      // })
  }

  async formatProfile(): Promise<Model.Applicant> {
    const user = await this.asyncLocalStorage.getItem('user');
    const { profileDetailsForm, profileArraysForm, profileDocuments } = this.profileForm.controls;

    return {
      ...profileDetailsForm.value,
      ...profileArraysForm.value,
      ...profileDocuments.value,
      userId: JSON.parse(user)._id,
      email: JSON.parse(user).email
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
      case 'profileDocuments':
        const bodyInterview =  this.profileForm.controls[formCtrl].value;
        // this.jobFacade.saveInterview(bodyInterview.interviewQuestions)
        break;
    }
  }

  ngOnDestroy(): void {
    this.subscriptions$.unsubscribe();
  }

}
