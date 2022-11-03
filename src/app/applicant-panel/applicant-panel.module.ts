import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApplicantPanelComponent } from './applicant-panel.component';
import { RouterModule, Routes } from '@angular/router';
import { ApplicantDashboardComponent } from './applicant-dashboard/applicant-dashboard.component';
import { ApplicantGuard } from '@app-shared/guard/applicant.guard';

const routes: Routes = [
  {
    path: '',
    component: ApplicantPanelComponent,
    canActivate: [ApplicantGuard],
    children: [
      {
        path: 'dashboard', component: ApplicantDashboardComponent
      },
      { path: '', redirectTo: 'dashboard' }
    ]
  }
]

@NgModule({
  declarations: [
    ApplicantPanelComponent,
    ApplicantDashboardComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class ApplicantPanelModule { }
