import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobComponent } from './job.component';
import { JobCreateComponent } from './job-create/job-create.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@main/shared/shared.module';
import { CreateInterviewComponent } from './job-create/components/create-interview/create-interview.component';
import { PreviewJobPostStepComponent } from './job-create/components/preview-job-post-step/preview-job-post-step.component';
import { JobPostDetailStepComponent } from './job-create/components/job-post-detail-step/job-post-detail-step.component';
import { CreateJobPostStepComponent } from './job-create/components/create-job-post-step/create-job-post-step.component';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { JobEffects } from './state/job.effects';
import { JobFacade } from './state/job.facade';
import { jobReducer } from './state/job.reducer';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { JobListComponent } from './job-list/job-list.component';
import { JobExpiredComponent } from './job-expired/job-expired.component';

const routes: Routes = [
  { path: 'expired', component: JobExpiredComponent },
  { path: 'list', component: JobListComponent },
  { path: 'create', component: JobCreateComponent },
  { path: '', redirectTo: 'list', pathMatch: 'full' }
]

const exportedComponents = [
  JobComponent,
  JobCreateComponent,
  PreviewJobPostStepComponent,
  JobPostDetailStepComponent,
  CreateJobPostStepComponent,
  CreateInterviewComponent,
  JobListComponent,
  JobExpiredComponent
]

@NgModule({
  declarations: [
    ...exportedComponents,
    JobExpiredComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    StoreModule.forFeature('job', jobReducer),
    EffectsModule.forFeature([JobEffects]),
    RouterModule.forChild(routes)
  ],
  providers: [JobFacade],
  exports: [
    ...exportedComponents
  ]
})
export class JobModule { }
