import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-employer-settings',
  templateUrl: './employer-settings.component.html',
  styleUrls: ['./employer-settings.component.scss']
})
export class EmployerSettingsComponent implements OnInit {
  public stepperItems: any[] = [
    {
      id: 1,
      title: "Company Details"
    },
    {
      id: 2,
      title: "Company Users"
    },
    {
      id: 3,
      title: "Account Settings"
    },

  ];

  public stepper: number = 1;

  constructor() { }

  ngOnInit(): void {

  }

  changeStep(step: number): void {
    console.log(step);
    this.stepper = step;
  }
}
