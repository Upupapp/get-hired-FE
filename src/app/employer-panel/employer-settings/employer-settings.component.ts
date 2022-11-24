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
  asyncLocalStorage = {
    setItem: async function (key, value) {
      await Promise.resolve();
      localStorage.setItem(key, value);
    },
    getItem: async function (key) {
      await Promise.resolve();
      return localStorage.getItem(key);
    }
  };

  public stepperItems: any[] = [
    {
      id: 1,
      title: "Company Details",
      disabled: false
    },
    {
      id: 2,
      title: "Company Users",
      disabled: false
    },
    {
      id: 3,
      title: "Account Settings",
      disabled: false
    },

  ];

  public stepper: number = 1;
  companyId: string;


  constructor(
    private employeeFacade: EmployeeFacade,
    private dialog: MatDialog,
    private router: Router
  ) { }

  ngOnInit(): void {
    console.log('on settings');
    this.getUser();
  }

  changeStep(step: number): void {
    console.log(step);
    this.stepper = step;
  }

  getUser() {
    this.asyncLocalStorage.getItem('user')
      .then(details => {
        this.companyId = JSON.parse(details).companyId;
      });
  }
}
