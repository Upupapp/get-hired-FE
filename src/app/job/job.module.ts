import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobCreateComponent } from './job-create/job-create.component';
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
import { InterviewModule } from '@main/interview/interview.module';
import { JobListActionsComponent } from './job-list-actions/job-list-actions.component';
import { MaterialComponentsModule } from '@main/shared/components/material-components/material-components.module';
import { TableControlModalComponent } from './job-list/dialogs/table-control-modal/table-control-modal.component';
import { JobViewComponent } from './job-view/job-view.component';

// const routes: Routes = [
  // { path: 'expired', component: JobExpiredComponent },
  // { path: 'list', component: JobListComponent },
  // { path: 'create', component: JobCreateComponent },
  // { path: 'edit', component: JobCreateComponent },
  // { path: 'view/:id', component: JobViewComponent },
// ]

const exportedComponents = [
  JobCreateComponent,
  PreviewJobPostStepComponent,
  JobPostDetailStepComponent,
  CreateJobPostStepComponent,
  CreateInterviewComponent,
  JobListComponent,
  JobExpiredComponent,
  TableControlModalComponent,
  JobViewComponent
]

@NgModule({
  declarations: [
    ...exportedComponents,
    JobExpiredComponent,
    JobListActionsComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialComponentsModule,
    InterviewModule,
    StoreModule.forFeature('job', jobReducer),
    EffectsModule.forFeature([JobEffects]),
  ],
  providers: [JobFacade],
  exports: [
    ...exportedComponents
  ]
})
export class JobModule { }
