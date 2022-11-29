import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgChartsModule } from 'ng2-charts';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
// import { NgxOrgChartModule } from 'ngx-org-chart';
import { ApplicantsPanelRoutes } from './applicants-panel.routing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialComponentsModule } from '../../shared/components/material-components/material-components.module';
import { SharedModule } from '@app-shared/shared.module';
import { ApplicantsPanelComponent } from './applicants-panel.component';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';

import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { JobsOpeningComponent } from './pages/jobs-opening/jobs-opening.component';
import { InboxComponent } from './pages/inbox/inbox.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { AvatarComponent } from './pages/profile/components/avatar/avatar.component';
import { DetailsComponent } from './pages/profile/components/details/details.component';
import { UpdateProfileComponent } from './pages/update-profile/update-profile.component';
import { DocumentsComponent } from './pages/update-profile/components/documents/documents.component';
import { ProfileDetailsComponent } from './pages/update-profile/components/profile-details/profile-details.component';
import { ExperienceQualificationComponent } from './pages/update-profile/components/experience-qualification/experience-qualification.component';
import { WorkExperienceComponent } from './pages/update-profile/components/work-experience/work-experience.component';
import { EducationalBackgroundComponent } from './pages/update-profile/components/educational-background/educational-background.component';
import { AwardsComponent } from './pages/update-profile/components/awards/awards.component';
import { BannerComponent } from './pages/dashboard/components/banner/banner.component';
import { StatChartComponent } from './pages/dashboard/components/stat-chart/stat-chart.component';
import { StatTotalComponent } from './pages/dashboard/components/stat-total/stat-total.component';
import { JobsOpeningDetailsComponent } from './pages/jobs-opening/pages/jobs-opening-details/jobs-opening-details.component';
import { DocumentSubmittedComponent } from './pages/jobs-opening/pages/jobs-opening-details/component/document-submitted/document-submitted.component';
import { AnswerToInterviewComponent } from './pages/jobs-opening/pages/jobs-opening-details/component/answer-to-interview/answer-to-interview.component';
import { JobDetailsSectionComponent } from './pages/jobs-opening/pages/jobs-opening-details/component/job-details-section/job-details-section.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialComponentsModule,
    NgChartsModule,
    NgxMatTimepickerModule,
    // NgxOrgChartModule,
    SharedModule,
    RouterModule.forChild(ApplicantsPanelRoutes)
  ],
  declarations: [
    ApplicantsPanelComponent,
    HeaderComponent,
    SidebarComponent,
    DashboardComponent,
    JobsOpeningComponent,
    InboxComponent,
    ProfileComponent,
    SettingsComponent,
    AvatarComponent,
    DetailsComponent,
    UpdateProfileComponent,
    DocumentsComponent,
    ProfileDetailsComponent,
    ExperienceQualificationComponent,
    WorkExperienceComponent,
    EducationalBackgroundComponent,
    AwardsComponent,
    BannerComponent,
    StatChartComponent,
    StatTotalComponent,
    JobsOpeningDetailsComponent,
    DocumentSubmittedComponent,
    AnswerToInterviewComponent,
    JobDetailsSectionComponent,
  ]
})
export class ApplicantsPanelModule{ }
