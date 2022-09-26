import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HomeRoutes } from './home.routing';
import { HomeComponent } from './home.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialComponentsModule } from '../../shared/components/material-components/material-components.module';
import { BannerComponent } from './components/banner/banner.component';
import { JobCardComponent } from './components/job-card/job-card.component';
import { CompaniesComponent } from './components/companies/companies.component';
import { JobCardListViewComponent } from './components/job-card-list-view/job-card-list-view.component';
import { JobPostDetailsComponent } from './pages/job-post-details/job-post-details.component';
import { JobDetailsBannerComponent } from './components/job-details-banner/job-details-banner.component';
import { JobDetailsSidecardComponent } from './components/job-details-sidecard/job-details-sidecard.component';
import { JobDetailsMainCardComponent } from './components/job-details-main-card/job-details-main-card.component';
import { JobDetailsFeaturedJobsComponent } from './components/job-details-featured-jobs/job-details-featured-jobs.component';
import { JobPostsListComponent } from './components/job-posts-list/job-posts-list.component';
import { ExploreUsersComponent } from './components/explore-users/explore-users.component';
import { JobPostDetailsApplyComponent } from './pages/job-post-details-apply/job-post-details-apply.component';
import { JobDetailsInterviewComponent } from './components/job-details-interview/job-details-interview.component';
import { JobPostDetailsAnswerQuestionComponent } from './pages/job-post-details-answer-question/job-post-details-answer-question.component';
import { JobDetailsAnswerInterviewComponent } from './components/job-details-answer-interview/job-details-answer-interview.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialComponentsModule,
    RouterModule.forChild(HomeRoutes)
  ],
  declarations: [
    BannerComponent,
  	HomeComponent,
    JobCardComponent,
    CompaniesComponent,
    JobCardListViewComponent,
    JobPostDetailsComponent,
    JobDetailsBannerComponent,
    JobDetailsSidecardComponent,
    JobDetailsMainCardComponent,
    JobDetailsFeaturedJobsComponent,
    JobPostsListComponent,
    ExploreUsersComponent,
    JobPostDetailsApplyComponent,
    JobDetailsInterviewComponent,
    JobPostDetailsAnswerQuestionComponent,
    JobDetailsAnswerInterviewComponent,
  ]
})
export class HomeModule{ }
