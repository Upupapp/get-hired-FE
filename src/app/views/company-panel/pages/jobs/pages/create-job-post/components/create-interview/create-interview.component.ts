import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';

@Component({
  selector: 'app-create-interview-questions',
  animations: [mainAnimations],
  templateUrl: './create-interview.component.html',
  styleUrls: ['./create-interview.component.scss']
})
export class CreateInterviewComponent implements OnInit {
  @Input() jobPostInterviewQuestions: any;
  @Output() jobPostInterviewQuestionsEvent: EventEmitter<any> = new EventEmitter<any>();

  public interview_questions: any[] = [];
  public interviewInput: string = "";

  constructor() { }

  ngOnInit(): void {
  }

  addItem(event, arrayItem, field){
    let value = event?.target?.value || this.interviewInput;
    
    if(value){
      let index = arrayItem.findIndex(el => el === value);

      if(index === -1){
        arrayItem.push(value);
      }

      // rebuild request body
      this.rebuildObject(`${field}`, arrayItem);
    }
  }

  removeItem(item, arrayItem, field){
    let index = arrayItem?.findIndex(el => el?.id === item?.id);
    arrayItem.splice(index, 1);

    // rebuild request body
    this.rebuildObject(`${field}`, arrayItem);
  }

  rebuildObject(field, data){
    this.interviewInput = undefined;
    this.jobPostInterviewQuestions[`${field}`] = data;
    this.jobPostInterviewQuestionsEvent.emit(this.jobPostInterviewQuestions);

    console.log(this.jobPostInterviewQuestions)
  }

}
