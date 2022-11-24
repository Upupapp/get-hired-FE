import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';

@Component({
  selector: 'app-educational-background',
  animations: [mainAnimations],
  templateUrl: './educational-background.component.html',
  styleUrls: ['./educational-background.component.scss']
})
export class EducationalBackgroundComponent implements OnInit {
  public month: string[] = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  public year: number[] = new Array(30).fill(0).map((el, i) => 1995 + i);
  public levelOfEducation: string[] = ["Primary education", "Upper Secondary Education", "Bachelor’s or equivalent level", "Master’s or equivalent level", "Doctoral or equivalent level"]

  // educational background
  @Input() education_background: {
    level_of_education: string,
    field_of_study: string, 
    school_address: string, 
    school: string, 
    start_date: any,
    end_date: any,
  }

  @Input() index : number = 1;
  @Input() length: number = 1;

  @Output() addEducationBackgroundEvent: EventEmitter<any> = new EventEmitter();

  public start_date: {
    month: string,
    year: number
  }

  public end_date: {
    month: string,
    year: number
  }

  constructor() { }

  ngOnInit(): void {
    this.start_date  = {
      month: this.month[this.education_background?.start_date?.getMonth()],  
      year: this.education_background?.start_date?.getFullYear()
    }

    this.end_date  = {
      month: this.month[this.education_background?.end_date?.getMonth()],  
      year: this.education_background?.end_date?.getFullYear()
    }
  }

  addEducationBackground(){
    this.addEducationBackgroundEvent.emit(true);
  }

  removeEducationBackground(index){
    this.addEducationBackgroundEvent.emit({
      index: index
    });
  }
}
