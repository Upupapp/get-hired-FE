import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployerSettingsComponent } from './employer-settings.component';
import { SharedModule } from '@main/shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { CompanyModule } from '@main/company/company.module';
import { EmployerCompanyDetailsComponent } from './employer-company-details/employer-company-details.component';
import { EmployerCompanyUsersComponent } from './employer-company-users/employer-company-users.component';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { EmployerCompanyComponent } from '../employer-company/employer-company.component';
import { EmployerAccountSettingsComponent } from './employer-account-settings/employer-account-settings.component';
import { AuthFacade } from '@main/auth/state/auth.facade';
import { EmployeeFacade } from '@main/employee/state/employee.facade';

const routes: Routes = [
  { path: 'settings', component: EmployerSettingsComponent },
  { path: 'details', redirectTo: 'settings', pathMatch: 'full' },
  { path: '', redirectTo: 'settings', pathMatch: 'full' }
];

@NgModule({
  declarations: [
    EmployerSettingsComponent,
    EmployerCompanyDetailsComponent,
    EmployerCompanyUsersComponent,
    EmployerCompanyComponent,
    EmployerAccountSettingsComponent
  ],
  imports: [
    CommonModule,
    CompanyModule,
    MatDialogModule,
    SharedModule,
    RouterModule.forChild(routes)
  ],
  providers: [AuthFacade, EmployeeFacade]
})
export class EmployerSettingsModule { }
