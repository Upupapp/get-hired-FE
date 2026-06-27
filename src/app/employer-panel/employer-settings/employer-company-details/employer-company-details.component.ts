// GETHIRED_COMPANY_SETTINGS_PUBLIC_PROFILE_FULL_REVAMP_V2_BRAND_OS_NEXTADMIN
// Phase 5 — passes updateCompany event up to EmployerSettingsComponent so the
// employee profile is refreshed (topbar companyName$ updates) after a save.
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { EmployeeFacade } from '@main/employee/state/employee.facade';
import { mainAnimations } from '@main/shared/animations/main-animations';

@Component({
  selector: 'app-employer-company-details',
  templateUrl: './employer-company-details.component.html',
  styleUrls: ['./employer-company-details.component.scss'],
  animations: [mainAnimations]
})
export class EmployerCompanyDetailsComponent implements OnInit {
  @Output() updateCompany: EventEmitter<any> = new EventEmitter();

  constructor(
    private employeeFacade: EmployeeFacade
  ) { }

  ngOnInit(): void {
  }

  onUpdate(event: any) {
    if (event && event.status) {
      // Refresh employee profile so topbar reads the updated companyName
      this.employeeFacade.getEmployeeProfile(event.userId);
      // Bubble up to parent (EmployerSettingsComponent)
      this.updateCompany.emit(event);
    }
  }
}
