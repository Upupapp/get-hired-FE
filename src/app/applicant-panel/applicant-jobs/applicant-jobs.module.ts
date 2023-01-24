import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@app-shared/shared.module';

import { NgChartsModule } from 'ng2-charts';
import { RouterModule, Routes } from '@angular/router';
import { ApplicantJobsComponent } from './applicant-jobs.component';

const routes: Routes = [
  { path: '', component: ApplicantJobsComponent }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SharedModule,
    NgChartsModule,
    RouterModule.forChild(routes)
  ]
})
export class ApplicantJobsModule { }
