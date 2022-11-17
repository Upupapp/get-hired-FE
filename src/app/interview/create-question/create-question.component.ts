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
  @Output() addItem = new EventEmitter();
  questionsForm: FormGroup;

  constructor(
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.questionsForm = this.fb.group({
      question: ['', Validators.required],
      answerDuration: [null, Validators.required],
      retakes: [null, Validators.required]
    });
  }

  add() {
    if(this.questionsForm.valid) {
      this.addItem.emit(this.questionsForm.value);
      this.questionsForm.reset();
    }
  }

}
