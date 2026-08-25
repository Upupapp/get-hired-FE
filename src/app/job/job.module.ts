import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
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
import { MaterialComponentsModule } from '@main/shared/components/material-components/material-components.module';
import { TableControlModalComponent } from './job-list/dialogs/table-control-modal/table-control-modal.component';
import { JobViewComponent } from './job-view/job-view.component';
import { JobApplicantsComponent } from './job-applicants/job-applicants.component';
import { ApplicantActionModalComponent } from './job-applicants/applicant-action-modal/applicant-action-modal.component';
import { ApplicationModule } from '@main/application/application.module';
import { ApplicantModule } from '@app-applicant/applicant.module';
import { ApplicantFacade } from '@app-applicant/state/applicant.facade';
import { JobAppliedComponent } from './job-applied/job-applied.component';
// B13: Job Readiness Bar + Chips
import { JobReadinessBarComponent } from './components/job-readiness-bar/job-readiness-bar.component';
import { JobReadinessChipsComponent } from './components/job-readiness-chips/job-readiness-chips.component';
// Comprehensive/Simplified job-post mode picker (Start From Scratch)
import { JobPostModeDialogComponent } from './job-create/components/job-post-mode-dialog/job-post-mode-dialog.component';

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
  JobViewComponent,
  JobApplicantsComponent,
  ApplicantActionModalComponent,
  // B13: Job Readiness
  JobReadinessBarComponent,
  JobReadinessChipsComponent,
  JobPostModeDialogComponent,
]

@NgModule({
  declarations: [
    ...exportedComponents,
    JobExpiredComponent,
    JobAppliedComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialComponentsModule,
    InterviewModule,
    ApplicationModule,
    ApplicantModule,
    StoreModule.forFeature('job', jobReducer),
    EffectsModule.forFeature([JobEffects]),
  ],
  providers: [JobFacade, DatePipe, CurrencyPipe, ApplicantFacade],
  exports: [
    ...exportedComponents
  ]
})
export class JobModule { }
