import { Component, OnInit, Input } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-job-details-answer-interview',
  animations: [mainAnimations],
  templateUrl: './job-details-answer-interview.component.html',
  styleUrls: ['./job-details-answer-interview.component.scss']
})
export class JobDetailsAnswerInterviewComponent implements OnInit {
  @Input() data: any;
  
  public interview_questions: any[] = [
    "How long have you been using Angular?", 
    "Have you use ngRx/ngsx and rxJS before?",
    "Are you available for short term or long term?",
    "Describe your previous project and experience",
    "How did this job post interests you?"
  ];

  public question: any = this.interview_questions[1];

  constructor(public router: Router,  
    public route: ActivatedRoute) { }

  ngOnInit(): void {
  }

}
