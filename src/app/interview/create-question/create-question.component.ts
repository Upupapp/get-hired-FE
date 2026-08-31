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
    // BUGFIX (production 422 on Submit after editing a question): the
    // form's own `sequence` control is only ever set once, in ngOnInit,
    // from `questionIndex` -- the question's *position in the list at the
    // moment the edit dialog opened*, not its real, persisted sequence
    // number. After any earlier delete in the same session, the backend
    // has already renumbered the remaining questions' real sequences
    // (deleteInterviewQuestion in jobsController.js does this
    // immediately), so a stale positional index sent back here could
    // silently overwrite a question's sequence to a value that collides
    // with another question's -- the backend then rejects the next
    // save/publish with 422. Always send the question's own real,
    // original sequence back unchanged; only the fields the user actually
    // edited (question/answerDuration/retakes) come from the form.
    this.addItem.emit({
      ...this.questionsForm.value,
      sequence: this.interviewQuestion.sequence,
      questionId: this.interviewQuestion.questionId
    });
  }

  cancel() {
    this.addItem.emit(null);
  }

}
