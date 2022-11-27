import { Component, OnInit } from '@angular/core';
import { EmployeeFacade } from '@main/employee/state/employee.facade';
import { mainAnimations } from '@main/shared/animations/main-animations';

@Component({
  selector: 'app-employer-company-details',
  templateUrl: './employer-company-details.component.html',
  styleUrls: ['./employer-company-details.component.scss'],
  animations: [mainAnimations]
})
export class EmployerCompanyDetailsComponent implements OnInit {

  constructor(
    private employeeFacade: EmployeeFacade
  ) { }

  ngOnInit(): void {
  }

  onUpdate(event) {
    if(event.status) {
      this.employeeFacade.getEmployeeProfile(event.userId)
    }
  }

}
