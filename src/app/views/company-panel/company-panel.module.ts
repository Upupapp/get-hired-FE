import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CompanyPanelRoutes } from './company-panel.routing';
import { CompanyPanelComponent } from './company-panel.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialComponentsModule } from '../../shared/components/material-components/material-components.module';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { JobsComponent } from './pages/jobs/jobs.component';
import { ApplicantsComponent } from './pages/applicants/applicants.component';
import { AccountDetailsComponent } from './pages/account-details/account-details.component';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { BannerComponent } from './pages/dashboard/components/banner/banner.component';
import { StatChartComponent } from './pages/dashboard/components/stat-chart/stat-chart.component';
import { NgChartsModule } from 'ng2-charts';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { NgxOrgChartModule } from 'ngx-org-chart';
import { StatTotalComponent } from './pages/dashboard/components/stat-total/stat-total.component';
import { SharedModule } from '@app-shared/shared.module';

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
  ]
})
export class CompanyPanelModule{ }
