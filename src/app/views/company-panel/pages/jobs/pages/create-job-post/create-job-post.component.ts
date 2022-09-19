import { Component, OnInit } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';

@Component({
  selector: 'app-create-job-post',
  animations: [mainAnimations],
  templateUrl: './create-job-post.component.html',
  styleUrls: ['./create-job-post.component.scss']
})
export class CreateJobPostComponent implements OnInit {
  public stepper: number = 1;
  
  constructor() { }

  ngOnInit(): void {
  }

  changeStep(number){
    this.stepper = number;
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }

}
