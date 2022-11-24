import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';

@Component({
  selector: 'app-work-experience',
  animations: [mainAnimations],
  templateUrl: './work-experience.component.html',
  styleUrls: ['./work-experience.component.scss']
})
export class WorkExperienceComponent implements OnInit {
  public month: string[] = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  public year: number[] = new Array(30).fill(0).map((el, i) => 1995 + i);
  public jobType: string[] = ["Full-time", "Part-time"];
  public levelOfEducation: string[] = ["Primary education", "Upper Secondary Education", "Bachelor’s or equivalent level", "Master’s or equivalent level", "Doctoral or equivalent level"]

  @Input() work_experience: {
    title: string,  
    job_type: string,
    details: string,
    location: string,
    company: string,
    start_date: any,
    end_date: any,
    currently_work_here: boolean
  };

  @Input() index : number = 1;
  @Input() length: number = 1;

  @Output() addExperienceEvent: EventEmitter<any> = new EventEmitter();

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
      month: this.month[this.work_experience?.start_date?.getMonth()],  
      year: this.work_experience?.start_date?.getFullYear()
    }

    this.end_date  = {
      month: this.month[this.work_experience?.end_date?.getMonth()],  
      year: this.work_experience?.end_date?.getFullYear()
    }
  }

  addExperience(){
    this.addExperienceEvent.emit(true);
  }

  removeExperience(index){
    this.addExperienceEvent.emit({
      index: index
    });
  }
}
