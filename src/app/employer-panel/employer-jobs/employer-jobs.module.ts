import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobModule } from '@app-job/job.module';
import { EmployerJobsComponent } from './employer-jobs.component';
import { RouterModule, Routes } from '@angular/router';
import { JobCreateComponent } from '@app-job/job-create/job-create.component';

const routes: Routes = [
  // { path: 'create', component: JobCreateComponent }
];

@NgModule({
  declarations: [
    EmployerJobsComponent
  ],
  imports: [
    CommonModule,
    JobModule,
    RouterModule.forChild(routes)
  ]
})
export class EmployerJobsModule { }
