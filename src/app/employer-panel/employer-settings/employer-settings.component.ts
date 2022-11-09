import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CompanyNotSetupComponent } from '@main/company/company-not-setup/company-not-setup.component';
import { EmployeeFacade } from '@main/employee/state/employee.facade';

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



  constructor(
    private employeeFacade: EmployeeFacade,
    private dialog: MatDialog,
    private router: Router
  ) { }

  ngOnInit(): void {
    console.log('on settings');
  }

  changeStep(step: number): void {
    console.log(step);
    this.stepper = step;
  }
}
