import { Component, OnInit } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';

@Component({
  selector: 'app-create-job-post',
  animations: [mainAnimations],
  templateUrl: './create-job-post.component.html',
  styleUrls: ['./create-job-post.component.scss']
})
export class CreateJobPostComponent implements OnInit {
  public jobPostData: any = {
    jobPostCategory: {},  
    jobPostDetails: {},
    jobPostInterviewQuestions: {}
  }

  public stepper: number = 1;
  
  constructor() { }

  ngOnInit(): void {
  }

  changeStep(number: number){
    this.stepper = number;
  }

  updateObject(data: any, field: string){
    this.jobPostData[`${field}`] = data;
    console.log(data, field, this.jobPostData)
  }

}
