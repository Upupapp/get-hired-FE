import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployerPanelComponent } from './employer-panel.component';
import { RouterModule, Routes } from '@angular/router';
import { EmployerDashboardComponent } from './employer-dashboard/employer-dashboard.component';
import { EmployerGuard } from '@app-shared/guard/employer.guard';
import { CoreModule } from '@main/core/core.module';
import { EmployerSidebarComponent } from './employer-sidebar/employer-sidebar.component';
import { EmployeeModule } from '@main/employee/employee.module';
import { SharedModule } from '@main/shared/shared.module';
import { InternalEmployerGuard } from './employer-internal-authguard';
import { EmployeeFacade } from '@main/employee/state/employee.facade';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';

const routes: Routes = [
  {
    path: '',
    component: EmployerPanelComponent,
    children: [
      {
        path: 'dashboard',
        component: EmployerDashboardComponent,
        canActivate: [InternalEmployerGuard]
      },
      {
        path: 'company',
        loadChildren: () => import('./employer-settings/employer-settings.module').then(m => m.EmployerSettingsModule)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
]

@NgModule({
  declarations: [
    EmployerPanelComponent,
    EmployerDashboardComponent,
    EmployerSidebarComponent
  ],
  imports: [
    CommonModule,
    CoreModule,
    MatDialogModule,
    SharedModule,
    EmployeeModule,
    RouterModule.forChild(routes)
  ],
  providers: [InternalEmployerGuard]
})
export class EmployerPanelModule { }
