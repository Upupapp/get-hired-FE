import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobModule } from '@main/job/job.module';
import { EmployerJobsComponent } from './employer-jobs.component';



@NgModule({
  declarations: [
    EmployerJobsComponent
  ],
  imports: [
    CommonModule,
    JobModule
  ]
})
export class EmployerJobsModule { }
