import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployerPanelComponent } from './employer-panel.component';
import { RouterModule, Routes } from '@angular/router';
import { EmployerDashboardComponent } from './employer-dashboard/employer-dashboard.component';
import { EmployerGuard } from '@app-shared/guard/employer.guard';

const routes: Routes = [
  {
    path: '',
    component: EmployerPanelComponent,
    canActivate: [EmployerGuard],
    children: [
      {
        path: 'dashboard', component: EmployerDashboardComponent
      },
      { path: '', redirectTo: 'dashboard' }
    ]
  }
]

@NgModule({
  declarations: [
    EmployerPanelComponent,
    EmployerDashboardComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class EmployerPanelModule { }
