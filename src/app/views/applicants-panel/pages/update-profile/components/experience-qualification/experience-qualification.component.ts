import { Component, OnInit } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';

@Component({
  selector: 'app-experience-qualification',
  animations: [mainAnimations],
  templateUrl: './experience-qualification.component.html',
  styleUrls: ['./experience-qualification.component.scss']
})
export class ExperienceQualificationComponent implements OnInit {
  public skill_requirements: string[] = [];
  public skillModel: string = "";  
  
  public month: string[] = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  public year: number[] = new Array(18).fill(0).map((el, i) => 2005 + i)
  public jobType: string[] = ["Full-time", "Part-time"];
  public levelOfEducation: string[] = ["Primary education", "Upper Secondary Education", "Bachelor’s or equivalent level", "Master’s or equivalent level", "Doctoral or equivalent level"]

  constructor() { }

  ngOnInit(): void {
  }

  addItem(event, arrayItem, field){
    let value = event?.target?.value;
    let index = arrayItem.findIndex(el => el === value);

    if(index === -1){
      arrayItem.push(value);
    }

    this.skillModel = undefined;
  }

  removeItem(item, arrayItem, field){
    let index = arrayItem?.findIndex(el => el?.id === item?.id);
    arrayItem.splice(index, 1);
  }

}
