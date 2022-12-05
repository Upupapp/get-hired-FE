import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
  @Output() nextStep = new EventEmitter();

  interviewTab: string = 'questions';
  selectedIndex: number = 0;

  constructor() { }

  ngOnInit(): void {
    console.log(this.interviews)
  }

  changeQuestion(index) {
    if(index < this.interviews.length) {
      this.selectedIndex = index;
    } else {
      this.nextStep.emit(4); // Go to Summary
    }
  }

}
