import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';
import * as Model from '../interview.model';

@Component({
  selector: 'app-view-interview-question',
  templateUrl: './view-interview-question.component.html',
  styleUrls: ['./view-interview-question.component.scss'],
  animations: [mainAnimations]
})
export class ViewInterviewQuestionComponent implements OnInit {
  @Output() remove = new EventEmitter();
  @Output() record = new EventEmitter();
  @Output() upload = new EventEmitter();

  @Input() canDelete: boolean = false;
  @Input() index: number;
  @Input() item: Model.InterviewQuestion;

  constructor() { }

  ngOnInit(): void {
    console.log('ANO na')
  }

  removeItem(index) {
    this.remove.emit(index)
  }

  recordItem(index) {
    console.log(index);
    this.record.emit(index)
  }

  uploadItem(index) {

  }

}
