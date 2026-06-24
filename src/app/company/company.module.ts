import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CompanyComponent } from './company.component';
import { CompanyFacade } from './state/company.facade';
import { CompanyEffects } from './state/company.effects';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { companyReducer } from './state/company.reducer';
import { CompanyDetailsFormComponent } from './company-details-form/company-details-form.component';
import { SharedModule } from '@app-shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { CompanyUsersComponent } from './company-users/company-users.component';
import { CompanyNotSetupComponent } from './company-not-setup/company-not-setup.component';
import { MatDialogModule } from '@angular/material/dialog';
import { CompanyDetailsComponent } from './company-details/company-details.component';
import { BannerDetailsComponent } from './company-details/components/banner-details/banner-details.component';
import { CompanyDashboardComponent } from './company-dashboard/company-dashboard.component';
import { DashboardBannerComponent } from './company-dashboard/components/dashboard-banner/dashboard-banner.component';
import { DashboardChartsComponent } from './company-dashboard/components/dashboard-charts/dashboard-charts.component';
import { DashboardStatisticsComponent } from './company-dashboard/components/dashboard-statistics/dashboard-statistics.component';
import { NgChartsModule } from 'ng2-charts';
import { JobsModule } from '@main/jobs/jobs.module';
import { ImportAddUserComponent } from './company-users/dialogs/import-add-user.component/import-add-user.component';
import { CompanyBasicComponent } from './company-basic/company-basic.component';

const exportedComponents = [
  CompanyComponent,
  CompanyDetailsFormComponent,
  CompanyUsersComponent,
  CompanyNotSetupComponent,
  CompanyDetailsComponent,
  BannerDetailsComponent,
  CompanyDashboardComponent,
  DashboardBannerComponent,
  DashboardChartsComponent,
  DashboardStatisticsComponent,
  ImportAddUserComponent,
  CompanyBasicComponent,
];

@NgModule({
  declarations: [
    ...exportedComponents,
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    SharedModule,
    MatDialogModule,
    NgChartsModule,
    JobsModule,
    StoreModule.forFeature('company', companyReducer),
    EffectsModule.forFeature([CompanyEffects])
  ],
  exports: [...exportedComponents],
  providers: [CompanyFacade]
})
export class CompanyModule { }
