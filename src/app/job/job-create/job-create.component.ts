import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { JobFacade } from '@app-job/state/job.facade';
import { distinctUntilChanged, Subscription } from 'rxjs';
import * as Model from '../job.model';

@Component({
  selector: 'app-job-create',
  templateUrl: './job-create.component.html',
  styleUrls: ['./job-create.component.scss']
})
export class JobCreateComponent implements OnInit, OnDestroy {
  subscriptions = new Subscription()
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

  jobForm: FormGroup
  stepper: number = 1;
  initialFormValid: boolean = false;
  jobInfoValid: boolean = false;
  interviewValid: boolean = false;
  isReadyToPublish: boolean;

  stepperItems: any[] = [
    {
      id: 1,
      title: "Job Details"
    },
    {
      id: 2,
      title: "Rates and Roles",
      disabled: !this.initialFormValid
    },

    {
      id: 3,
      title: "Create Interview",
      disabled: !this.jobInfoValid
    },

    {
      id: 4,
      title: "Preview Job Post",
      disabled: !this.interviewValid
    },
  ];

  initial$ = this.jobFacade.initial$
    .pipe().subscribe(this.setInitialForm.bind(this));
  info$ = this.jobFacade.info$
    .pipe().subscribe(this.setJobInfo.bind(this));
  success$ = this.jobFacade.success$
    .pipe().subscribe(this.afterSubmit.bind(this));

  constructor(
    private fb: FormBuilder,
    private jobFacade: JobFacade,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute
  ) { }


  ngOnInit(): void {
    this.jobForm = this.fb.group({
      initialData: this.fb.group({
        jobTitle: ['', Validators.required],
        jobTypeId: [null],
        jobLevelId: [null],
        jobAddress: [''],
        jobCity: [''],
        jobDescription: [''],
        jobDuties: [''],
        jobCategoryId: [null],
        workSetupId: [null],
        bannerFile: new FormArray([]),
        badges: new FormArray([]),
        requirements: new FormArray([]),
        goodToHave: new FormArray([]),
        educationalBackground: new FormArray([]),
        requirementsTxt: [''],
        goodToHaveTxt: [''],
        educationalBackgroundTxt: ['']
      }),
      jobInfo: this.fb.group({
        industryId: [null],
        jobRoleId: [null],
        jobSkills: new FormArray([]),
        jobSkillsTxt: [''],
        jobTags: new FormArray([]),
        jobTagsTxt: [''],
        rate: [''],
        salaryMinimum: [null],
        salaryMaximum: [null]
        // contractStart: DetailedDate;
        // contractEnd: DetailedDate;
      }),
      interview: this.fb.group({
        interviewQuestions: new FormArray([])
      })
    });

    this.subscriptions.add(
      this.jobForm.controls.initialData.statusChanges.pipe(distinctUntilChanged()).subscribe((status) => {
        this.initialFormValid = status === 'VALID'
        this.stepperItems[1].disabled = status != 'VALID'
      }));

    this.subscriptions.add(
      this.jobForm.controls.jobInfo.statusChanges.pipe(distinctUntilChanged()).subscribe((status) => {
        this.jobInfoValid = status === 'VALID'
        this.stepperItems[2].disabled = status != 'VALID'

      }));

    this.subscriptions.add(
      this.jobForm.controls.interview.statusChanges.pipe(distinctUntilChanged()).subscribe((status) => {
        this.interviewValid = status === 'VALID'
        this.stepperItems[3].disabled = status != 'VALID'
      }));

  }

  setInitialForm(raw: Model.InitialDetails) {
    if (raw) {
      this.jobForm.controls.initialData.get('jobTitle').setValue(raw.jobTitle);
      this.jobForm.controls.initialData.get('jobTypeId').setValue(raw.jobTypeId);
      this.jobForm.controls.initialData.get('jobLevelId').setValue(raw.jobLevelId);
      this.jobForm.controls.initialData.get('jobLevelId').setValue(raw.jobLevelId);
      this.jobForm.controls.initialData.get('workSetupId').setValue(raw.workSetupId);
      this.jobForm.controls.initialData.get('jobAddress').setValue(raw.jobAddress);
      this.jobForm.controls.initialData.get('jobCity').setValue(raw.jobCity);
      this.jobForm.controls.initialData.get('jobDescription').setValue(raw.jobDescription);
      this.jobForm.controls.initialData.get('jobDuties').setValue(raw.jobDuties);
      this.jobForm.controls.initialData.get('jobCategoryId').setValue(raw.jobCategoryId);
      this.jobForm.controls.initialData.get('badges').setValue(raw.badges);
      this.jobForm.controls.initialData.get('requirements').setValue(raw.requirements);
      this.jobForm.controls.initialData.get('goodToHave').setValue(raw.goodToHave);
      this.jobForm.controls.initialData.get('bannerFile').setValue(raw.bannerFile);

    }
  }

  setJobInfo(raw: Model.JobInfo) {
    if (raw) {
      this.jobForm.controls.jobInfo.get('industryId').setValue(raw.industryId);
      this.jobForm.controls.jobInfo.get('jobRoleId').setValue(raw.jobRoleId);
      this.jobForm.controls.jobInfo.get('jobSkills').setValue(raw.jobSkills);
      this.jobForm.controls.jobInfo.get('jobTags').setValue(raw.jobTags);
      this.jobForm.controls.jobInfo.get('rate').setValue(raw.rate);
      this.jobForm.controls.jobInfo.get('salaryMinimum').setValue(raw.salaryMinimum);
      this.jobForm.controls.jobInfo.get('salaryMaximum').setValue(raw.salaryMaximum);
    }
  }

  async saveAsDraft() {
    const job: Model.Job = await this.formatJob(1);
    console.log(job);

    this.jobFacade.saveJob(job);
  }

  async publishJobPost() {
    const job: Model.Job = await this.formatJob(2);

    this.isReadyToPublish = job.jobTypeId &&
      job.jobLevelId &&
      job.jobCity != "" &&
      job.jobDescription != "" &&
      job.workSetupId &&
      job.bannerFile[0] &&
      job.badges.length != 0 &&
      job.requirements.length != 0 &&
      job.jobSkills.length != 0 &&
      job.interviewQuestions.length != 0

    if(this.isReadyToPublish) {
      this.jobFacade.saveJob(job);
    } else {
      this.snackBar.open(`Job not ready to be Published`, '', {
        duration: 4000,
        panelClass: ['success-snackbar'],
      });
    }

  }

  async formatJob(status) {
    const user = await this.asyncLocalStorage.getItem('user');

    const { initialData, jobInfo, interview } = this.jobForm.controls;
    const { interviewQuestions } = interview.value;

    return {
      ...initialData.value,
      ...jobInfo.value,
      badges: initialData.value ? this.formatBadgesGetId(initialData.value.badges) : [],
      interviewQuestions,
      companyId: JSON.parse(user).companyId,
      jobStatusId: status
    };
  }

  afterSubmit(event) {
    if (event == 'asDraft') {
      this.snackBar.open(`Job successfully save as Draft.`, '', {
        duration: 4000,
        panelClass: ['success-snackbar'],
      });
      this.router.navigate(['../list'], { relativeTo: this.route });
    } else if (event == 'published') {
      this.snackBar.open(`Job successfully published`, '', {
        duration: 4000,
        panelClass: ['success-snackbar'],
      });
    }
  }

  formatBadgesGetId(rawBadges) {
    if (rawBadges && rawBadges.length != 0) {
      return rawBadges.map(badge => badge.id);
    } else {
      return [];
    }
  }

  cancel() {
    this.jobFacade.resetFormState();
    this.router.navigate(['../'], { relativeTo: this.route })
  }

  changeStep(number: number, formName?: string) {
    this.stepper = number;
    switch (formName) {
      case 'initialData':
        const bodyInitial = this.jobForm.controls[formName].value;
        this.jobFacade.saveInitialForm(bodyInitial);
        break;
      case 'jobInfo':
        const bodyInfo = this.jobForm.controls[formName].value;
        this.jobFacade.saveJobInfo(bodyInfo);
        break;
      case 'interview':
        const bodyInterview = this.jobForm.controls[formName].value;
        this.jobFacade.saveInterview(bodyInterview.interviewQuestions)
        break;
    }
  }

  ngOnDestroy() {
    this.jobFacade.resetFormState();
    this.subscriptions.unsubscribe();
  }
}
