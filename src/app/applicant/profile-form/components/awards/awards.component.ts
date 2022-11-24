import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';

@Component({
  selector: 'app-awards-details',
  animations: [mainAnimations],
  templateUrl: './awards.component.html',
  styleUrls: ['./awards.component.scss']
})
export class AwardsComponent implements OnInit {
  @Input() awards: {
    title: string,  
    job_type: string, 
    company: string, 
    location: string, 
    details: string, 
    start_date: any, 
    end_date: any, 
    does_not_expire: boolean
  };

  @Input() index : number = 1;
  @Input() length: number = 1;

  @Output() addAwardEvent: EventEmitter<any> = new EventEmitter();

  public month: string[] = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  public year: number[] = new Array(30).fill(0).map((el, i) => 1995 + i);
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
      month: this.month[this.awards?.start_date?.getMonth()],  
      year: this.awards?.start_date?.getFullYear()
    }

    this.end_date  = {
      month: this.month[this.awards?.end_date?.getMonth()],  
      year: this.awards?.end_date?.getFullYear()
    }
  }

  addAward(){
    this.addAwardEvent.emit(true);
  }

  removeAward(index){
    this.addAwardEvent.emit({
      index: index
    });
  }

}
