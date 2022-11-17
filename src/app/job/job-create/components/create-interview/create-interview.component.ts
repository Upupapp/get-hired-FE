import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormArray, FormControl, FormGroup, FormGroupDirective } from '@angular/forms';
import { mainAnimations } from '@app-shared/animations/main-animations';

@Component({
  selector: 'app-create-interview-questions',
  animations: [mainAnimations],
  templateUrl: './create-interview.component.html',
  styleUrls: ['./create-interview.component.scss']
})
export class CreateInterviewComponent implements OnInit {
  @Input() formGroupName: any;

  interviewQuestions: FormArray;
  interviewForm: FormGroup;

  public interview_questions: any[] = ["How long have you been using angular?", "Are You Available For Part-time or Full-time?"];
  public interviewInput: string = "";

  constructor(
    private rootFormGroup: FormGroupDirective,
  ) { }

  ngOnInit(): void {
    this.interviewForm = this.rootFormGroup.control.get(this.formGroupName) as FormGroup;
    this.interviewQuestions = this.interviewForm.get('interviewQuestions') as FormArray;
  }

  addQuestion(item) {
    this.interviewQuestions.push(new FormGroup({
      question: new FormControl(item.question),
      answerDuration: new FormControl(item.answerDuration),
      retakes: new FormControl(item.retakes)
    }));
  }

  addItem(event, arrayItem, field){
    let value = event?.target?.value || this.interviewInput;

    if(value){
      let index = arrayItem.findIndex(el => el === value);

      if(index === -1){
        arrayItem.push(value);
      }

      // rebuild request body
    }
  }

  removeItem(index: number, controlArray: FormArray) {
    controlArray.removeAt(index);
  }

}
