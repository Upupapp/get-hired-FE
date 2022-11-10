import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployerSettingsComponent } from './employer-settings.component';
import { SharedModule } from '@main/shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { CompanyModule } from '@main/company/company.module';
import { EmployerCompanyDetailsComponent } from './employer-company-details/employer-company-details.component';
import { EmployerCompanyUsersComponent } from './employer-company-users/employer-company-users.component';
import { AuthModule } from '@main/auth/auth.module';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { EmployerCompanyComponent } from '../employer-company/employer-company.component';

const routes: Routes = [
  { path: 'details', component: EmployerCompanyComponent },
  { path: 'settings', component: EmployerSettingsComponent },
  { path: '', redirectTo: 'settings', pathMatch: 'full' }
];

@NgModule({
  declarations: [
    EmployerSettingsComponent,
    EmployerCompanyDetailsComponent,
    EmployerCompanyUsersComponent,
    EmployerCompanyComponent
  ],
  imports: [
    CommonModule,
    CompanyModule,
    MatDialogModule,
    SharedModule,
    AuthModule,
    RouterModule.forChild(routes)
  ],
  providers:[]
})
export class EmployerSettingsModule { }
