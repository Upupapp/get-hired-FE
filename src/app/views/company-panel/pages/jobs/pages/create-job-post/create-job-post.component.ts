import { Component, OnInit } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';

@Component({
  selector: 'app-create-job-post',
  animations: [mainAnimations],
  templateUrl: './create-job-post.component.html',
  styleUrls: ['./create-job-post.component.scss']
})
export class CreateJobPostComponent implements OnInit {
  public stepper: number = 2;
  
  constructor() { }

  ngOnInit(): void {
  }

  changeStep(number){
    this.stepper = number;
  }

}
