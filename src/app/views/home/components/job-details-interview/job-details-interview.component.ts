import { Component, OnInit, Input } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';

@Component({
  selector: 'app-job-details-interview',
  animations: [mainAnimations],
  templateUrl: './job-details-interview.component.html',
  styleUrls: ['./job-details-interview.component.scss']
})
export class JobDetailsInterviewComponent implements OnInit {
  @Input() data: any;
 
  public interview_questions: any[] = [
    "How long have you been using Angular?", 
    "Have you use ngRx/ngsx and rxJS before?",
    "Are you available for short term or long term?",
    "Describe your previous project and experience",
    "How did this job post interests you?"
  ];
  constructor() { }

  ngOnInit(): void {
  }

}
