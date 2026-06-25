import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobModule } from '@app-job/job.module';
import { EmployerJobsComponent } from './employer-jobs.component';
import { RouterModule, Routes } from '@angular/router';
import { JobCreateComponent } from '@app-job/job-create/job-create.component';
import { EmployerJoblistComponent } from './employer-joblist/employer-joblist.component';
import { EmployerJobexpiredComponent } from './employer-jobexpired/employer-jobexpired.component';
import { EmployerJobcreateComponent } from './employer-jobcreate/employer-jobcreate.component';
import { EmployerJobviewComponent } from './employer-jobview/employer-jobview.component';
import { EmployerApplicantsComponent } from '../employer-applicants/employer-applicants.component';
// B05 V1: Job-level dashboard — post-publish landing page
import { EmployerJobDashboardComponent } from './employer-job-dashboard/employer-job-dashboard.component';

const routes: Routes = [
  { path: 'list', component: EmployerJoblistComponent },
  { path: 'expired', component: EmployerJobexpiredComponent },
  { path: 'create', component: EmployerJobcreateComponent },
  { path: 'edit', component: EmployerJobcreateComponent },
  { path: 'applicants', component: EmployerApplicantsComponent },
  { path: 'view', component: EmployerJobviewComponent },
  // B05 V1: Post-publish job-level dashboard
  { path: 'dashboard', component: EmployerJobDashboardComponent },
  { path: '', redirectTo: 'list', pathMatch: 'full' },
];

@NgModule({
  declarations: [
    EmployerJobsComponent,
    EmployerJoblistComponent,
    EmployerJobexpiredComponent,
    EmployerJobcreateComponent,
    EmployerJobviewComponent,
    EmployerApplicantsComponent,
    // B05 V1
    EmployerJobDashboardComponent,
  ],
  imports: [
    CommonModule,
    JobModule,
    RouterModule.forChild(routes)
  ]
})
export class EmployerJobsModule { }
