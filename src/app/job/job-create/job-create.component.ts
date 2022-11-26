import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { JobFacade } from '@app-job/state/job.facade';
import { distinctUntilChanged, Subscription } from 'rxjs';
import * as Model from '../job.model';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { map, takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: 'app-job-create',
  animations: [mainAnimations],
  templateUrl: './job-create.component.html',
  styleUrls: ['./job-create.component.scss']
})
export class JobCreateComponent implements OnInit, OnDestroy {
  mode: string;
  delayControl: boolean = true;
  public jobId: any = null;
  subscriptions = new Subscription();

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
  loading: boolean = true;
  initial$: any;
  info$: any;

  stepperItems: any[] = [
    {
      id: 1,
      title: "Job Details",
      formName: 'initialData'
    },
    {
      id: 2,
      title: "Rates and Roles",
      disabled: !this.initialFormValid,
      formName: 'jobInfo'
    },

    {
      id: 3,
      title: "Create Interview",
      disabled: !this.jobInfoValid,
      formName: 'interview'
    },

    {
      id: 4,
      title: "Preview Job Post",
      disabled: !this.interviewValid
    },
  ];

  success$ = this.jobFacade.success$
    .pipe().subscribe(this.afterSubmit.bind(this));
  editJob$ = this.jobFacade.getJobById$
    .pipe(
      map(job => {
        return (job)
      })
    );
  loading$ = this.jobFacade.getJobLoading$
    .pipe().subscribe(this.onLoad.bind(this));

  constructor(
    private fb: FormBuilder,
    private jobFacade: JobFacade,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.route.queryParams.subscribe(params => {
      this.jobId = params.id;
    });
  }


  ngOnInit(): void {
    setTimeout(() => this.delayControl = false, 900);

    this.editJob$.subscribe((data: any) => {
      if (data) {
        this.setFormGroup(data);
      }
    })

    if (this.jobId) {
      this.getJobById()
    } else {
      this.setFormGroup();
    }
  }

  onLoad(isLoading) {
    this.loading = isLoading;
  }

  setFormGroup(data?: any) {
    this.jobForm = this.fb.group({
      initialData: this.fb.group({
        jobTitle: [data ? data.jobTitle : null, Validators.required],
        jobTypeId: [data ? data.jobTypeId : null],
        jobLevelId: [data ? data.jobLevelId : null],
        jobAddress: [data ? data.jobAddress : null],
        jobCity: [data ? data.jobCity : null, Validators.required],
        jobCountry: [data ? data.jobCountry : null, Validators.required],
        jobDescription: [data ? data.jobDescription : null],
        jobDuties: [data ? data.jobDuties : null],
        jobCategoryId: [data ? data.jobCategoryId : null],
        workSetupId: [data ? data.workSetupId : null],
        jobBanner: [data ? data.jobBanner : null],
        bannerFile: new FormArray([]),
        badges: new FormArray([]),
        requirements: new FormArray([]),
        goodToHave: new FormArray([]),
        educationalBackground: new FormArray([]),
        requirementsTxt: [null],
        goodToHaveTxt: [null],
        educationalBackgroundTxt: [null]
      }),
      jobInfo: this.fb.group({
        industryId: [data ? data.industryId : null],
        jobRoleId: [data ? data.jobRoleId : null],
        skills: new FormArray([]),
        jobSkillsTxt: [null],
        tags: new FormArray([]),
        jobTagsTxt: [null],
        rate: [data ? data.rate : null],
        salaryMinimum: [data ? data.salaryMinimum : null],
        salaryMaximum: [data ? data.salaryMaximum : null]
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

    if (data) {
      //set form array
      let badges = this.jobForm.controls.initialData.get('badges') as FormArray;
      if (data.hasOwnProperty('badges') && data?.badges.length > 0) {
        data?.badges.forEach(element => {
          badges.push(
            new FormGroup({
              icon: new FormControl(element.icon),
              name: new FormControl(element.name),
              id: new FormControl(element.id)
            }));
        });
      }

      let goodToHave = this.jobForm.controls.initialData.get('goodToHave') as FormArray;
      if (data.hasOwnProperty('goodToHave') && data?.goodToHave.length > 0) {
        data?.goodToHave.forEach(element => {
          goodToHave.push(new FormControl(element));
        });
      }

      let requirements = this.jobForm.controls.initialData.get('requirements') as FormArray;
      if(data.hasOwnProperty('requirements') &&  data?.requirements.length > 0){
        data.requirements.forEach(element => {
          requirements.push(new FormControl(element));
        })
      }

      let educationalBackground = this.jobForm.controls.initialData.get('educationalBackground') as FormArray;
      if(data.hasOwnProperty('educationalBackground') &&  data?.educationalBackground.length > 0){
        data.educationalBackground.forEach(element => {
          educationalBackground.push(new FormControl(element));
        })
      }

      let skills = this.jobForm.controls.jobInfo.get('skills') as FormArray;
      if(data.hasOwnProperty('skills') &&  data?.skills.length > 0){
        data.skills.forEach(element => {
          skills.push(new FormControl(element));
        })
      }

      let tags = this.jobForm.controls.jobInfo.get('tags') as FormArray;
      if(data.hasOwnProperty('tags') &&  data?.tags.length > 0){
        data.tags.forEach(element => {
          tags.push(new FormControl(element));
        })
      }

      let interviewQuestions = this.jobForm.controls.interview.get('interviewQuestions') as FormArray;
      if(data.hasOwnProperty('interviewQuestions') &&  data?.interviewQuestions.length > 0){
        data.interviewQuestions.forEach(element => {
          interviewQuestions.push(new FormGroup({
            question: new FormControl(element.question),
            answerDuration: new FormControl(element.answerDuration),
            retakes: new FormControl(element?.retakes)
          }));
        })
      }

    }

    // this.initial$ = this.jobFacade.initial$
    //   .pipe().subscribe(this.setInitialForm.bind(this));

    // this.info$ = this.jobFacade.info$
    //   .pipe().subscribe(this.setJobInfo.bind(this));


  }

  // setInitialForm(raw: Model.InitialDetails) {
  //   if (raw) {
  //     this.jobForm.controls.initialData.get('jobTitle').setValue(raw.jobTitle);
  //     this.jobForm.controls.initialData.get('jobTypeId').setValue(raw.jobTypeId);
  //     this.jobForm.controls.initialData.get('jobLevelId').setValue(raw.jobLevelId);
  //     this.jobForm.controls.initialData.get('jobLevelId').setValue(raw.jobLevelId);
  //     this.jobForm.controls.initialData.get('workSetupId').setValue(raw.workSetupId);
  //     this.jobForm.controls.initialData.get('jobAddress').setValue(raw.jobAddress);
  //     this.jobForm.controls.initialData.get('jobCity').setValue(raw.jobCity);
  //     this.jobForm.controls.initialData.get('jobCountry').setValue(raw.jobCountry);
  //     this.jobForm.controls.initialData.get('jobDescription').setValue(raw.jobDescription);
  //     this.jobForm.controls.initialData.get('jobDuties').setValue(raw.jobDuties);
  //     this.jobForm.controls.initialData.get('jobCategoryId').setValue(raw.jobCategoryId);
  //     this.jobForm.controls.initialData.get('badges').setValue(raw.badges);
  //     this.jobForm.controls.initialData.get('requirements').setValue(raw.requirements);
  //     this.jobForm.controls.initialData.get('goodToHave').setValue(raw.goodToHave);
  //     this.jobForm.controls.initialData.get('bannerFile').setValue(raw.bannerFile);
  //   }
  // }

  // setJobInfo(raw: Model.JobInfo) {
  //   if (raw) {
  //     this.jobForm.controls.jobInfo.get('industryId').setValue(raw.industryId);
  //     this.jobForm.controls.jobInfo.get('jobRoleId').setValue(raw.jobRoleId);
  //     this.jobForm.controls.jobInfo.get('skills').setValue(raw.skills);
  //     this.jobForm.controls.jobInfo.get('tags').setValue(raw.tags);
  //     this.jobForm.controls.jobInfo.get('rate').setValue(raw.rate);
  //     this.jobForm.controls.jobInfo.get('salaryMinimum').setValue(raw.salaryMinimum);
  //     this.jobForm.controls.jobInfo.get('salaryMaximum').setValue(raw.salaryMaximum);
  //   }
  // }

  async getJobById() {
    await this.jobFacade.getJobById(this.jobId);
  }

  async saveAsDraft() {
    const job: Model.Job = await this.formatJob(1);
    console.log(job);

    this.jobFacade.saveJob(job);
  }

  async publishJobPost() {
    const job: Model.Job = await this.formatJob(2);
    console.log('YOUR JOB')
    console.log(job);

    this.isReadyToPublish = job.jobTypeId &&
      job.jobLevelId &&
      job.jobCity != "" &&
      job.jobCountry != "" &&
      job.jobDescription != "" &&
      job.workSetupId &&
      (job.bannerFile[0] || job.jobBanner != "") &&
      job.interviewQuestions.length != 0

    if (this.isReadyToPublish) {
      this.jobFacade.saveJob(job);
    } else {
      let missingJob = '';

      if (!job.jobTypeId) {
        missingJob += 'job type ';
      }

      if (!job.jobLevelId) {
        missingJob += 'job level ';
      }

      if (job.jobCity == "") {
        missingJob += 'job city ';
      }

      if (job.jobCountry == "") {
        missingJob += 'job jobCountry ';
      }

      if (job.jobDescription == "") {
        missingJob += 'job Description ';
      }

      if (!job.workSetupId) {
        missingJob += 'Work Setup Id ';
      }

      if (job.interviewQuestions.length == 0) {
        missingJob += 'Interview Questions ';
      }

      if (!job.bannerFile[0] && job.jobBanner == "") {
        missingJob += 'Job Banner ';
      }

      if (job.companyId == '') {
        missingJob += 'Company Id ';
      }

      this.snackBar.open(`Job not ready to be Published. Missing: ${missingJob}`, '', {
        duration: 5000,
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
      jobStatusId: status,
      jobId: this.jobId
    };
  }

  afterSubmit(event) {
    if (event == 'asDraft') {
      this.snackBar.open(`Job successfully save as Draft.`, '', {
        duration: 4000,
        panelClass: ['success-snackbar'],
      });
      this.router.navigate(['/recruiter/jobs/list'], { relativeTo: this.route });
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

  changeStep(event) {
    this.stepper = event;
    const formCtrl = this.stepperItems[event - 2]?.formName;

    switch (formCtrl) {
      case 'initialData':
        const bodyInitial = this.jobForm.controls[formCtrl].value;
        console.log(bodyInitial);
        this.jobFacade.saveInitialForm(bodyInitial);
        break;
      case 'jobInfo':
        const bodyInfo = this.jobForm.controls[formCtrl].value;
        this.jobFacade.saveJobInfo(bodyInfo);
        break;
      case 'interview':
        const bodyInterview = this.jobForm.controls[formCtrl].value;
        this.jobFacade.saveInterview(bodyInterview.interviewQuestions)
        break;
    }
  }

  ngOnDestroy() {
    this.jobFacade.resetFormState();
    this.subscriptions.unsubscribe();
  }
}
