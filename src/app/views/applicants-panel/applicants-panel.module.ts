import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgChartsModule } from 'ng2-charts';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { NgxOrgChartModule } from 'ngx-org-chart';
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
  ]
})
export class ApplicantsPanelModule{ }
