import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobCardComponent } from './job-card/job-card.component';
import { JobsFacade } from './state/jobs.facade';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { jobsReducer } from './state/jobs.reducer';
import { JobsEffects } from './state/jobs.effects';
import { SharedModule } from '@app-shared/shared.module';
import { JobPostsListComponent } from './job-posts-list/job-posts-list.component';
import { JobCardListViewComponent } from './job-card-list-view/job-card-list-view.component';

// Employer-only extraction (2026-08-12): narrowed to exactly what
// company/company-details.component.html needs (<app-job-posts-list>, which
// itself uses <app-job-card>/<app-job-card-list-view>) -- confirmed by trace,
// this is the ONLY employer consumer of jobs/ (plural). JobsComponent,
// JobPostsDetailsComponent, JobDetailsSidecardComponent,
// JobMatchPanelComponent, CompanySnapshotComponent, VideoInterviewBadgeComponent
// and the JobModule (singular, job-creation UI) import were all
// job-seeker-only (public-details/job-posts-details apply flow), removed.
const exportedComponents = [
  JobCardComponent,
  JobPostsListComponent,
  JobCardListViewComponent,
];

@NgModule({
  declarations: [
    ...exportedComponents,
  ],
  imports: [
    CommonModule,
    SharedModule,
    StoreModule.forFeature('jobs', jobsReducer),
    EffectsModule.forFeature([JobsEffects]),
  ],
  exports: [
    ...exportedComponents
  ],
  providers: [JobsFacade]
})
export class JobsModule { }
