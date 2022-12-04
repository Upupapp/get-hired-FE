import { Component, Input, OnInit } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';
import * as InterviewModel from '@main/interview/interview.model';

@Component({
  selector: 'app-interview-questions',
  templateUrl: './interview-questions.component.html',
  styleUrls: ['./interview-questions.component.scss'],
  animations: [mainAnimations]
})
export class InterviewQuestionsComponent implements OnInit {
  @Input() interviews: InterviewModel.InterviewQuestion[];

  interviewTab: string = 'questions';
  selectedIndex: number = 0;

  constructor() { }

  ngOnInit(): void {
    console.log(this.interviews)
  }

}
