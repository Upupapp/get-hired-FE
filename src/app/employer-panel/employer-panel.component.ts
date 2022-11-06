import { Component, OnInit } from '@angular/core';
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

  constructor(
    private coreService: CoreService,
    private employeeFacade: EmployeeFacade
  ) { }

  ngOnInit(): void {
    console.log('im here');
    this.isUserLoggedIn = this.coreService.isLoggedIn();
    this.employeeFacade.getEmployeeProfile(this.userId);
  }

}
