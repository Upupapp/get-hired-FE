import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { mainAnimations } from '@app-shared/animations/main-animations';

@Component({
  selector: 'app-create-question',
  templateUrl: './create-question.component.html',
  styleUrls: ['./create-question.component.scss'],
  animations: [mainAnimations]
})
export class CreateQuestionComponent implements OnInit {
  @Input() questionIndex: number = 1;
  @Input() interviewQuestion = null;
  @Output() addItem = new EventEmitter();
  questionsForm: FormGroup;

  constructor(
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.questionsForm = this.fb.group({
      question: [this.interviewQuestion ? this.interviewQuestion.question: null, Validators.required],
      answerDuration: [this.interviewQuestion ? this.interviewQuestion.answerDuration:null, Validators.required],
      retakes: [this.interviewQuestion ? this.interviewQuestion.retakes:null, Validators.required],
      sequence: [this.questionIndex]
    });
  }

  add() {
    if(this.questionsForm.valid) {
      this.addItem.emit(this.questionsForm.value);
      this.questionsForm.reset();
    }
  }

  update() {
    this.addItem.emit({
      ...this.questionsForm.value,
      questionId: this.interviewQuestion.questionId
    });
  }

  cancel() {
    this.addItem.emit(null);
  }

}
