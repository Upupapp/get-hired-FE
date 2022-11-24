import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobsComponent } from './jobs.component';
import { JobCardComponent } from './job-card/job-card.component';
import { JobsFacade } from './state/jobs.facade';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { jobsReducer } from './state/jobs.reducer';
import { JobsEffects } from './state/jobs.effects';
import { SharedModule } from '@app-shared/shared.module';
import { JobPostsListComponent } from './job-posts-list/job-posts-list.component';
import { JobCardListViewComponent } from './job-card-list-view/job-card-list-view.component';
import { JobPostsDetailsComponent } from './job-posts-details/job-posts-details.component';

const exportedComponents = [
  JobsComponent,
  JobCardComponent,
  JobPostsListComponent,
  JobCardListViewComponent
];

@NgModule({
  declarations: [
    ...exportedComponents,
    JobPostsDetailsComponent
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
