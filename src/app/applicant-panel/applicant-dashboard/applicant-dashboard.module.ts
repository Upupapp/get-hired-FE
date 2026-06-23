import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@app-shared/shared.module';
import { StatChartComponent } from './components/stat-chart/stat-chart.component';
import { StatTotalComponent } from './components/stat-total/stat-total.component';
import { BannerComponent } from './components/banner/banner.component';
import { ApplicantDashboardComponent } from './applicant-dashboard.component';
import { NgChartsModule } from 'ng2-charts';
import { RouterModule, Routes } from '@angular/router';
import { ProfileReadinessPanelComponent } from './components/profile-readiness-panel/profile-readiness-panel.component';
import { RecommendedJobsComponent } from './components/recommended-jobs/recommended-jobs.component';
import { JobsModule } from '@main/jobs/jobs.module';

const routes: Routes = [
  { path: '', component: ApplicantDashboardComponent }
];

@NgModule({
  declarations: [
    StatChartComponent,
    StatTotalComponent,
    BannerComponent,
    ApplicantDashboardComponent,
    ProfileReadinessPanelComponent,
    RecommendedJobsComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    NgChartsModule,
    RouterModule.forChild(routes),
    JobsModule
  ]
})
export class ApplicantDashboardModule { }
