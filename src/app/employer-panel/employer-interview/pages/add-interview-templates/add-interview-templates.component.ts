import { Component, OnInit } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';

@Component({
  selector: 'app-add-interview-templates',
  animations: [mainAnimations],
  templateUrl: './add-interview-templates.component.html',
  styleUrls: ['./add-interview-templates.component.scss']
})
export class AddInterviewTemplatesComponent implements OnInit {
  public stepperItems: any[] = [
    {
      id: 1,
      title: "Interview Questions",
      valid: true
    },

    {
      id: 2,
      title: "Publish",
      valid: true
    },
  ];

  public stepper: number = 1;

  constructor() { }

  ngOnInit(): void {
    
  }

  changeStep(step: number): void {
    this.stepper = step;

  }

}
