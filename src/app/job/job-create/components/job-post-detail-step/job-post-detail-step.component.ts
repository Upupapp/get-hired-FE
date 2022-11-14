import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { JobFacade } from '@app-job/state/job.facade';
import { mainAnimations } from '@app-shared/animations/main-animations';
import * as Model from '@app-job/job.model';

@Component({
  selector: 'app-job-post-detail-step',
  animations: [mainAnimations],
  templateUrl: './job-post-detail-step.component.html',
  styleUrls: ['./job-post-detail-step.component.scss']
})
export class JobPostDetailStepComponent implements OnInit {
  @Input() jobPostDetails: any;
  @Output() jobPostDetailsEvent: EventEmitter<any> = new EventEmitter<any>();

  initialDetailsForm: FormGroup;

  workSetup$ = this.jobFacade.setup$;
  typeList$ = this.jobFacade.typeList$;
  level$ = this.jobFacade.level$;

  workSetupSelected: number;

  public jobType: string[] = ["Full-time", "Part-time"];
  public jobLevel: string[] = ["Intern/Student", "Fresher/Entry Level", "Intermediate: 2-3 Years Experience", "Advance: 5 Years+ Experience", "C-Level"]
  public badges: any[] = [
    {
      id: "career-growth",
      title: "Career Growth",
      logo: "badge-1.png"
    },
    {
      id: "performance-incentive",
      title: "Performance Incentive",
      logo: "badge-1.png"
    },
    {
      id: "benefit-package",
      title: "Benefit Package",
      logo: "badge-2.png"
    },
    {
      id: "gender-equality",
      title: "Gender Equality",
      logo: "badge-3.png"
    },
    {
      id:"work-life-balance",
      title: "Work-life Balance",
      logo: "badge-2.png"
    },
    {
      id:"friendly-environment",
      title: "Friendly Environment",
      logo: "badge-3.png"
    },
    {
      id:"flexitime",
      title: "Flexitime",
      logo: "badge-2.png"
    },
  ];

  public categories: any[] = [
    {
      id: 1,
      title: 'Technology',
      skills: 100,
      rating: 4.2,
      banner_thumbnail: '/assets/images/placeholder/industry-1.png'
    },
    {
      id: 2,
      title: 'Sales & Marketing',
      skills: 154,
      rating: 4.6,
      banner_thumbnail: '/assets/images/placeholder/industry-2.png'
    },

    {
      id: 3,
      title: 'Development & Marketing',
      skills: 98,
      rating: 4.1,
      banner_thumbnail: '/assets/images/placeholder/industry-1.png'
    },

    {
      id: 4,
      title: 'Architecture',
      skills: 144,
      rating: 4.7,
      banner_thumbnail: '/assets/images/placeholder/industry-1.png'
    },

    {
      id: 5,
      title: 'Software Engineering',
      skills: 255,
      rating: 4.7,
      banner_thumbnail: '/assets/images/placeholder/industry-2.png'
    },

    {
      id: 6,
      title: 'Database Architecture',
      skills: 117,
      rating: 4.4,
      banner_thumbnail: '/assets/images/placeholder/industry-1.png'
    },

    {
      id: 7,
      title: 'Civil Engineering',
      skills: 224,
      rating: 4.5,
      banner_thumbnail: '/assets/images/placeholder/industry-2.png'
    },

    {
      id: 8,
      title: 'Virtual Assistant',
      skills: 89,
      rating: 4.1,
      banner_thumbnail: '/assets/images/placeholder/industry-2.png'
    },
  ];

  public address: string = '';
  public title: string = '';
  public job_type: string = '';
  public job_description: string = '';
  public job_duties: string = '';
  public badgeSelected: any[] = [];
  public skill_experience: any[] = [];
  public education_requirements: any[] = [];
  public other_requirements: string[] =  [];

  public skillExperienceModel: string = ""
  public educationRequirementsModel: string = ""
  public otherRequirementsModel: string = ""


  public job_level: string = "";

  constructor(
    private jobFacade: JobFacade,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.populateOptions();
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });

    this.initialDetailsForm = this.fb.group({
      jobTitle: ['', Validators.required],
      jobTypeId: [''],
      jobLevelId: [''],
      jobAddress: [''],
      jobCity: [''],
      jobDescription: [''],
      jobDuties: ['']
    })
  }

  populateOptions(){
    this.jobFacade.getType();
    this.jobFacade.getLevel();
    this.jobFacade.getSetup();
  }

  saveInitial() {
    if(this.initialDetailsForm.valid) {
      const body: Model.InitialDetails = {
        ...this.initialDetailsForm.value,
        workSetupId: this.workSetupSelected
      };

      console.log(body);
    }
  }

  addBadge(item){
    let index = this.badgeSelected?.findIndex(el => el?.id === item?.id);

    console.log(index)

    if(index === -1){
      this.badgeSelected.push(item);
    }

    this.rebuildObject('badge', this.badgeSelected);

    //else this.badgeSelected.splice(index, 1);
  }

  addItem(event, arrayItem, field){
    let value = event?.target?.value;
    let index = arrayItem.findIndex(el => el === value);

    if(index === -1){
      arrayItem.push(value);
    }

    // rebuild request body
    this.rebuildObject(`${field}`, arrayItem);
  }

  removeItem(item, arrayItem, field){
    let index = arrayItem?.findIndex(el => el?.id === item?.id);
    arrayItem.splice(index, 1);

    // rebuild request body
    this.rebuildObject(`${field}`, arrayItem);
  }


  rebuildObject(field, data){
    this.jobPostDetails[`${field}`] = data;
    this.jobPostDetailsEvent.emit(this.jobPostDetails);

    this.skillExperienceModel = undefined;
    this.educationRequirementsModel = undefined;
    this.otherRequirementsModel = undefined;
    console.log(this.jobPostDetails)
  }
}
