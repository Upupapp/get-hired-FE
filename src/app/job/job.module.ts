import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobComponent } from './job.component';
import { JobCreateComponent } from './job-create/job-create.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: 'create', component: JobCreateComponent },
  { path: '', redirectTo: 'create', pathMatch: 'full' }
]

const exportedComponents = [
  JobComponent,
  JobCreateComponent
]

@NgModule({
  declarations: [
    ...exportedComponents
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    ...exportedComponents
  ]
})
export class JobModule { }
