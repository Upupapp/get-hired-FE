import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';

@Component({
  selector: 'app-main-stepper',
  animations: [mainAnimations],
  templateUrl: './main-stepper.component.html',
  styleUrls: ['./main-stepper.component.scss']
})
export class MainStepperComponent implements OnInit {
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
