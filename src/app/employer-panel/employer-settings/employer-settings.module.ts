import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployerSettingsComponent } from './employer-settings.component';
import { SharedModule } from '@main/shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { CompanyModule } from '@main/company/company.module';
import { EmployerCompanyDetailsComponent } from './employer-company-details/employer-company-details.component';
import { EmployerCompanyUsersComponent } from './employer-company-users/employer-company-users.component';
import { AuthModule } from '@main/auth/auth.module';
import { MatDialogModule } from '@angular/material/dialog';

const routes: Routes = [
  { path: 'settings', component: EmployerSettingsComponent },
  { path: '', redirectTo: 'settings', pathMatch: 'full' }
];

@NgModule({
  declarations: [
    EmployerSettingsComponent,
    EmployerCompanyDetailsComponent,
    EmployerCompanyUsersComponent
  ],
  imports: [
    CommonModule,
    CompanyModule,
    MatDialogModule,
    SharedModule,
    AuthModule,
    RouterModule.forChild(routes)
  ]
})
export class EmployerSettingsModule { }
