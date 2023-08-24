import { Component, OnInit } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';

@Component({
  selector: 'app-employer-interview-question-templates',
  templateUrl: './employer-interview-question-templates.component.html',
  styleUrls: ['./employer-interview-question-templates.component.scss'],
  animations: [mainAnimations]
})
export class EmployerInterviewQuestionTemplatesComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  createTemplate() {

  }

}
