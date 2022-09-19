import { Component, OnInit } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';

@Component({
  selector: 'app-create-interview-questions',
  animations: [mainAnimations],
  templateUrl: './create-interview.component.html',
  styleUrls: ['./create-interview.component.scss']
})
export class CreateInterviewComponent implements OnInit {
  public requirements: any[] = [
    "Looking to add a pricing calculator",
    "Website Search no more",
    "User-based pricing calculator for you", 
    "Is your business operating in multiple countries",
  ];

  public interviewQuestions: any[] = [
    "What have been your key as a web designer?",
    "What is the meaning of color and color theory in visual design??",
    "What areas of your work or personal development are you hoping to explore further?",
    "What is the meaning of life?",
    "Please describe why you would like to work with a team and why you would like eat?",
  ]


  constructor() { }

  ngOnInit(): void {
  }

  

  addItem(event, arrayItem){
    let value = event?.target?.value;
    let index = arrayItem.findIndex(el => el === value);

    if(index === -1){
      arrayItem.push(value);
    }
  }

  removeItem(item, arrayItem){
    let index = arrayItem?.findIndex(el => el?.id === item?.id);
    arrayItem.splice(index, 1);
  }

}
