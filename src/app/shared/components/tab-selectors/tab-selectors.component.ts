import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';

@Component({
  selector: 'app-tab-selectors',
  templateUrl: './tab-selectors.component.html',
  styleUrls: ['./tab-selectors.component.scss']
})
export class TabSelectorsComponent implements OnInit {

  @Input() stepper: any = 1;  
  @Input() stepperItems: any[] = [];
  @Output() changeStepper: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  ngOnInit(): void {
  }

  changeStep(step: number): void {
    this.changeStepper.emit(step);
  }

}
