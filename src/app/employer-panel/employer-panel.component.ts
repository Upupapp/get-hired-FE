import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { CompanyNotSetupComponent } from '@main/company/company-not-setup/company-not-setup.component';
import { CoreService } from '@main/core/services/core.service';
import { EmployeeFacade } from '@main/employee/state/employee.facade';

@Component({
  selector: 'app-employer-panel',
  templateUrl: './employer-panel.component.html',
  styleUrls: ['./employer-panel.component.scss']
})
export class EmployerPanelComponent implements OnInit {
  isUserLoggedIn: boolean;
  userId = JSON.parse(localStorage.getItem('user'))._id;
  employee$ = this.employeeFacade.employeeDetails$;
  loading$ = this.employeeFacade.loading$;
  withCompany: boolean = true;
  path: string;


  constructor(
    private coreService: CoreService,
    private employeeFacade: EmployeeFacade,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.path = this.router.url;
   }

  ngOnInit(): void {
    console.log(this.path);
    this.isUserLoggedIn = this.coreService.isLoggedIn();
    this.employeeFacade.getEmployeeProfile(this.userId);
    this.employeeFacade.getEmployeeCompany(this.userId);
  }

}
