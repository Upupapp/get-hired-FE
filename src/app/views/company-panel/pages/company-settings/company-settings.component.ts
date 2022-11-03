import { Component, OnInit } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';

@Component({
  selector: 'app-company-settings',
  animations: [mainAnimations],
  templateUrl: './company-settings.component.html',
  styleUrls: ['./company-settings.component.scss']
})
export class CompanySettingsComponent implements OnInit {
  public stepperItems: any[] = [
    {
      id: 1,
      title: "Company Details"
    },

    {
      id: 2,
      title: "Company Settings"
    },

  ];

  public stepper: number = 1;

  constructor() { }

  ngOnInit(): void {
    
  }

  changeStep(step: number): void {
    this.stepper = step;

  }
}
