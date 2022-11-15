import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HomeRoutes } from './home.routing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialComponentsModule } from '../../shared/components/material-components/material-components.module';
import { BannerComponent } from './pages/job-posts/components/banner/banner.component';
import { JobCardComponent } from './components/job-card/job-card.component';
import { CompaniesComponent } from './pages/job-posts/components/companies/companies.component';
import { ExploreUsersComponent } from './pages/job-posts/components/explore-users/explore-users.component';
import { JobPostsComponent } from './pages/job-posts/job-posts.component';
import { JobCardListViewComponent } from './components/job-card-list-view/job-card-list-view.component';
import { JobPostDetailsComponent } from './pages/job-post-details/job-post-details.component';
import { JobDetailsBannerComponent } from './components/job-details-banner/job-details-banner.component';
import { JobDetailsSidecardComponent } from './components/job-details-sidecard/job-details-sidecard.component';
import { JobDetailsMainCardComponent } from './pages/job-post-details/components/job-details-main-card/job-details-main-card.component';
import { JobDetailsFeaturedJobsComponent } from './components/job-details-featured-jobs/job-details-featured-jobs.component';
import { JobPostsListComponent } from './components/job-posts-list/job-posts-list.component';
import { JobPostDetailsApplyComponent } from './pages/job-post-details-apply/job-post-details-apply.component';
import { JobDetailsInterviewComponent } from './components/job-details-interview/job-details-interview.component';
import { JobDetailsAnswerInterviewComponent } from './pages/job-post-details-apply/steps/interview-questions/components/job-details-answer-interview/job-details-answer-interview.component';
import { ProfilePreviewComponent } from './pages/job-post-details-apply/steps/profile-preview/profile-preview.component';
import { ProfileDocumentsComponent } from './pages/job-post-details-apply/steps/profile-documents/profile-documents.component';
import { InterviewQuestionsComponent } from './pages/job-post-details-apply/steps/interview-questions/interview-questions.component';
import { ApplicationPreviewComponent } from './pages/job-post-details-apply/steps/application-preview/application-preview.component';
import { ApplicantDetailsComponent } from './pages/job-post-details-apply/steps/profile-preview/components/applicant-details/applicant-details.component';
import { ApplicantAvatarComponent } from './pages/job-post-details-apply/steps/profile-preview/components/applicant-avatar/applicant-avatar.component';
import { SharedModule } from '@app-shared/shared.module';
import { RecordInterviewComponent } from './pages/job-post-details-apply/steps/interview-questions/components/record-interview/record-interview.component';
import { SettingsModalComponent } from './pages/job-post-details-apply/steps/interview-questions/components/settings-modal/settings-modal.component';
import { InterviewNotificationComponent } from './pages/job-post-details-apply/steps/interview-questions/components/interview-notification/interview-notification.component';
import { CompanyDetailsComponent } from './pages/company-details/company-details.component';
import { CompanyBannerComponent } from './pages/company-details/components/company-banner/company-banner.component';
import { TopJobsComponent } from './pages/company-details/components/top-jobs/top-jobs.component';
import { LatestJobPostComponent } from './pages/company-details/components/latest-job-post/latest-job-post.component';
import { JobPostSearchListComponent } from './pages/job-post-search-list/job-post-search-list.component';
import { JobPostSearchBannerComponent } from './pages/job-post-search-list/components/job-post-search-banner/job-post-search-banner.component';

@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialComponentsModule,
    RouterModule.forChild(HomeRoutes)
  ],
  declarations: [
    BannerComponent,
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
    JobDetailsAnswerInterviewComponent,
    ProfilePreviewComponent,
    ProfileDocumentsComponent,
    InterviewQuestionsComponent,
    ApplicationPreviewComponent,
    JobPostsComponent,
    ApplicantDetailsComponent,
    ApplicantAvatarComponent,
    RecordInterviewComponent,
    SettingsModalComponent,
    InterviewNotificationComponent,
    CompanyDetailsComponent,
    CompanyBannerComponent,
    TopJobsComponent,
    LatestJobPostComponent,
    JobPostSearchListComponent,
    JobPostSearchBannerComponent,
  ]
})
export class HomeModule{ }
