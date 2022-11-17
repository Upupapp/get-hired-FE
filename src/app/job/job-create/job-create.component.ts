import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { JobFacade } from '@app-job/state/job.facade';
import * as Model from '../job.model';

@Component({
  selector: 'app-job-create',
  templateUrl: './job-create.component.html',
  styleUrls: ['./job-create.component.scss']
})
export class JobCreateComponent implements OnInit {
  public jobPostData: any = {
    jobPostIndustry: {
      "industry": "Technology",
      "job_role": "Business Development",
      "skill_requirements": [
        "Web Development",
        "Angular 8/10/12",
        "Mongo",
        "TypeScript",
        "Advance JavaScript",
        "ES6 - Functional Programming"
      ],
      "tags": [
        "Web Development",
        "Angular Project",
        "Frontend"
      ],
      "rates": "Monthly",
      "salary_min": 45000,
      "salary_max": 55000
    },
    jobPostDetails: {
      "title": "Angular Developer Full-time",
      "job_type": "Full-time",
      "job_level": "Intermediate: 2-3 Years Experience",
      "work_setup": "Remote",
      "address": "Block 33, 123 Street Sampaloc Manila",
      "badge": [
        {
          "id": "career-growth",
          "title": "Career Growth",
          "logo": "badge-1.png"
        },
        {
          "id": "benefit-package",
          "title": "Benefit Package",
          "logo": "badge-2.png"
        },
        {
          "id": "performance-incentive",
          "title": "Performance Incentive",
          "logo": "badge-1.png"
        }
      ],
      "job_description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi u",
      "job_duties": "As a Product Designer, you will work within a Product Delivery Team fused with UX, engineering, product and data talent.",
      "skill_experience": [
        "Looking to add a pricing calculator",
        "Website Search no more",
        "User-based pricing calculator for you",
        "Is your business operating in multiple countries"
      ],
      "other_requirements": [
        "Graduated from a top university",
        "Proven success in school or at work"
      ],
      "education_requirements": [
        "Computer Science Graduate or related discipline is highly desired."
      ]
    },
    jobPostInterviewQuestions: {
      interview_questions: [
        "How long have you been using angular?",
        "Are You Available For Part-time or Full-time?"
      ]
    }
  }

  jobForm: FormGroup

  stepper: number = 1;

  stepperItems: any[] = [
    {
      id: 1,
      title: "Job Details"
    },

    {
      id: 2,
      title: "Rates and Roles"
    },

    {
      id: 3,
      title: "Create Interview"
    },

    {
      id: 4,
      title: "Preview Job Post"
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
        jobTypeId: [''],
        jobLevelId: [''],
        jobAddress: [''],
        jobCity: [''],
        jobDescription: [''],
        jobDuties: [''],
        jobCategoryId: [''],
        workSetupId: [''],
        bannerFile: [''],
        badges: new FormArray([]),
        requirements: new FormArray([]),
        goodToHave: new FormArray([]),
        educationalBackground: new FormArray([]),
        requirementsTxt: [''],
        goodToHaveTxt: [''],
        educationalBackgroundTxt: ['']
      }),
      jobInfo: this.fb.group({
        industryId: [''],
        jobRole: [''],
        jobSkills: new FormArray([]),
        jobSKillsTxt: [''],
        jobTags: new FormArray([]),
        jobTagsTxt: [''],
        jobRate: [''],
        salaryMinimum: [''],
        salaryMaximum: ['']
        // contractStart: DetailedDate;
        // contractEnd: DetailedDate;
      })
    });
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
      this.jobForm.controls.initialData.get('industryId').setValue(raw.industryId);
      this.jobForm.controls.initialData.get('jobRole').setValue(raw.jobRole);
      this.jobForm.controls.initialData.get('jobSkills').setValue(raw.jobSkills);
      this.jobForm.controls.initialData.get('jobTags').setValue(raw.jobTags);
      this.jobForm.controls.initialData.get('jobRate').setValue(raw.jobRate);
      this.jobForm.controls.initialData.get('salaryMinimum').setValue(raw.salaryMinimum);
      this.jobForm.controls.initialData.get('salaryMaximum').setValue(raw.salaryMaximum);
    }
  }

  saveAsDraft() {
    const job: Model.Job = {
      ...this.jobForm.controls.initialData.value,
      ...this.jobForm.controls.jobInfo.value,
      jobStatusId: 1 // As Draft
    };

    this.jobFacade.saveJob(job);
  }

  afterSubmit(event) {
    if (event == 'asDraft') {
      this.snackBar.open(`Job successfully save as Draft.`, '', {
        duration: 4000,
        panelClass: ['success-snackbar'],
      });
    } else if (event == 'published') {
      this.snackBar.open(`Job successfully published`, '', {
        duration: 4000,
        panelClass: ['success-snackbar'],
      });
    }
  }

  cancel() {
    this.router.navigate(['../'], { relativeTo: this.route})
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
    }
  }

  updateObject(data: any, field: string) {
    this.jobPostData[`${field}`] = data;
    console.log(data, field, this.jobPostData)
  }

  publishJobPost() {
    console.log(this.jobPostData)
  }
}
