import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgChartsModule } from 'ng2-charts';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { NgxOrgChartModule } from 'ngx-org-chart';
import { CompanyPanelRoutes } from './company-panel.routing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialComponentsModule } from '../../shared/components/material-components/material-components.module';
import { SharedModule } from '@app-shared/shared.module';
import { CompanyPanelComponent } from './company-panel.component';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { BannerComponent } from './pages/dashboard/components/banner/banner.component';
import { StatChartComponent } from './pages/dashboard/components/stat-chart/stat-chart.component';
import { StatTotalComponent } from './pages/dashboard/components/stat-total/stat-total.component';
import { JobsComponent } from './pages/jobs/jobs.component';
import { CreateJobPostComponent } from './pages/jobs/pages/create-job-post/create-job-post.component';
import { TableControlModalComponent as JobsControl } from './pages/jobs/dialogs/table-control-modal/table-control-modal.component';

import { ApplicantsComponent } from './pages/applicants/applicants.component';
import { AccountDetailsComponent } from './pages/account-details/account-details.component';
import { ExpiredJobsComponent } from './pages/expired-jobs/expired-jobs.component';
import { TableControlModalComponent as ApplicantsControl } from './pages/applicants/dialogs/table-control-modal/table-control-modal.component';
import { TableControlModalComponent as ExpiredJobsControl} from './pages/expired-jobs/dialogs/table-control-modal/table-control-modal.component';
import { CreateInterviewComponent } from './pages/create-interview/create-interview.component';
import { CreateJobPostStepComponent } from './pages/jobs/pages/create-job-post/components/create-job-post-step/create-job-post-step.component';
import { PreviewJobPostStepComponent } from './pages/jobs/pages/create-job-post/components/preview-job-post-step/preview-job-post-step.component';
import { CreateInterviewComponent as JobPostInterview } from './pages/jobs/pages/create-job-post/components/create-interview/create-interview.component';
import { JobPostDetailStepComponent } from './pages/jobs/pages/create-job-post/components/job-post-detail-step/job-post-detail-step.component';
import { BannerAccountDetailsComponent } from './pages/account-details/components/banner-account-details/banner-account-details.component';
import { LatestJobAccountDetailsComponent } from './pages/account-details/components/latest-job-account-details/latest-job-account-details.component';
import { FeaturedTopJobsAccountDetailsComponent } from './pages/account-details/components/featured-top-jobs-account-details/featured-top-jobs-account-details.component';
import { InterviewLinkAccountDetailsComponent } from './pages/account-details/components/interview-link-account-details/interview-link-account-details.component';
import { MySubscriptionComponent } from './pages/my-subscription/my-subscription.component';
import { ContactListComponent } from './pages/contact-list/contact-list.component';
import { AddContactComponent } from './pages/contact-list/dialogs/add-contact/add-contact.component';
import { ApplicantDetailsComponent } from './pages/applicants/pages/applicant-details/applicant-details.component';
import { ApplicantDetailsAvatarComponent } from './pages/applicants/components/applicant-details-avatar/applicant-details-avatar.component';
import { ApplicantDetailsMainComponent } from './pages/applicants/components/applicant-details-main/applicant-details-main.component';
import { CompanySettingsComponent } from './pages/company-settings/company-settings.component';
import { CompanyDetailsComponent } from './pages/company-settings/components/company-details/company-details.component';
import { AccountSettingsComponent } from './pages/company-settings/components/account-settings/account-settings.component';
import { AddAccessModalComponent } from './pages/company-settings/dialogs/add-access-modal/add-access-modal.component';
import { InviteApplicantModalComponent } from './pages/applicants/dialogs/invite-applicant-modal/invite-applicant-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialComponentsModule,
    NgChartsModule,
    NgxMatTimepickerModule,
    NgxOrgChartModule,
    SharedModule,
    RouterModule.forChild(CompanyPanelRoutes)
  ],
  declarations: [
   CompanyPanelComponent,
   DashboardComponent,
   JobsComponent,
   ApplicantsComponent,
   AccountDetailsComponent,
   HeaderComponent,
   SidebarComponent,
   BannerComponent,
   StatChartComponent,
   StatTotalComponent,
   ExpiredJobsComponent,
   JobsControl,
   ApplicantsControl,
   CreateInterviewComponent,
   ExpiredJobsControl,
   CreateJobPostComponent,
   CreateJobPostStepComponent,
   PreviewJobPostStepComponent,
   JobPostInterview,
   JobPostDetailStepComponent,
   BannerAccountDetailsComponent,
   LatestJobAccountDetailsComponent,
   FeaturedTopJobsAccountDetailsComponent,
   InterviewLinkAccountDetailsComponent,
   MySubscriptionComponent,
   ContactListComponent,
   AddContactComponent,
   ApplicantDetailsComponent,
   ApplicantDetailsAvatarComponent,
   ApplicantDetailsMainComponent,
   CompanySettingsComponent,
   CompanyDetailsComponent,
   AccountSettingsComponent,
   AddAccessModalComponent,
   InviteApplicantModalComponent
  ]
})
export class CompanyPanelModule{ }
