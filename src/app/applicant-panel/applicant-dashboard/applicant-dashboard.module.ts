import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@app-shared/shared.module';
import { StatChartComponent } from './components/stat-chart/stat-chart.component';
import { StatTotalComponent } from './components/stat-total/stat-total.component';
import { BannerComponent } from './components/banner/banner.component';
import { ApplicantDashboardComponent } from './applicant-dashboard.component';
import { NgChartsModule } from 'ng2-charts';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', component: ApplicantDashboardComponent }
];

@NgModule({
  declarations: [
    StatChartComponent,
    StatTotalComponent,
    BannerComponent,
    ApplicantDashboardComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    NgChartsModule,
    RouterModule.forChild(routes)
  ]
})
export class ApplicantDashboardModule { }
