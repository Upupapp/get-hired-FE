import { Component, OnInit, Input } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-answer-to-interview',
  animations: [mainAnimations],
  templateUrl: './answer-to-interview.component.html',
  styleUrls: ['./answer-to-interview.component.scss']
})
export class AnswerToInterviewComponent implements OnInit {
  @Input() data: any;
  public loggedUserData: any = JSON.parse(localStorage.getItem('userData'));
  public interview_questions: any[] = [
    "How long have you been using Angular?", 
    "Have you use ngRx/ngsx and rxJS before?",
    "Are you available for short term or long term?",
    "Describe your previous project and experience",
    "How did this job post interests you?"
  ];

  public interview_answers: any[] = [
    "Are you willing to learn ReactJS on other projects?"
  ];

  public question: any = "How long have you been using Angular?"
  public startRecording: boolean = false;
  public interviewTab: string = 'questions';

  constructor(public router: Router,  
    public route: ActivatedRoute) { 
    console.log(this.data)
  }

  ngOnInit(): void {
    this.interview_questions = [...this.interview_questions].filter(el => el !== this.question)
  }

  getQuestionIndex(question){
    return [this.question, this.interview_questions].findIndex(el => el === question) + 1;
  }

}
