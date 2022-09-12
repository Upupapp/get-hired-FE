import { Component, OnInit } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';

@Component({
  selector: 'app-job-post-stepper',
  animations: [mainAnimations],
  templateUrl: './job-post-stepper.component.html',
  styleUrls: ['./job-post-stepper.component.scss']
})
export class JobPostStepperComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
