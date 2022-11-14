import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { industries, job_role } from '@app-job/jobs-model-interface';

@Component({
  selector: 'app-create-job-post-step',
  animations: [mainAnimations],
  templateUrl: './create-job-post-step.component.html',
  styleUrls: ['./create-job-post-step.component.scss']
})
export class CreateJobPostStepComponent implements OnInit {
  @Input() jobPostIndustry: any;
  @Output() jobPostIndustryEvent: EventEmitter<any> = new EventEmitter<any>();

  public search: string = "";
  public industries: any[] = industries;
  public job_role: any[] = job_role;
  public rates: any[] = [
    {
      title: "Monthly",
      rate: "month",
      icon: '/rate-monthly'
    },

    {
      title: "Daily",
      rate: "day",
      icon: '/rate-daily'
    },

    {
      title: "Hourly",
      rate: "hour",
      icon: '/rate-24'
    },
  ];
  public industriesFiltered: any[] = [...this.industries];
  public skill_requirements: string[] = [];
  public tags: string[] = [];
  public selectedIndustry: any = "";
  public selectedJobRole: any = "";
  public selectedRates: any = "";
  public budget: any = {
    min: 0,
    max: 0
  }
  public project_duration = {
    start_date: new Date(),
    end_date: new Date()
  }

  public skillModel: string = "";
  public tagModel: string = "";
  public months: string[] = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];

  public days: number[] = new Array(31).fill(1).map((el,i) => i + 1);

  constructor() { }

  ngOnInit(): void {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
    console.log(this.jobPostIndustry)
  }

  generateProjectDuration(date){

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
    this.jobPostIndustry[`${field}`] = data;
    this.jobPostIndustryEvent.emit(this.jobPostIndustry);
    this.skillModel = undefined;
    this.tagModel = undefined;
  }

  searchIndustry(){
    const listDataSource = [...this.industries]
    .filter(el => {
      return JSON.stringify(el).toLowerCase().includes(this.search.toLowerCase());
    });

    this.industriesFiltered = listDataSource;

  }

}
