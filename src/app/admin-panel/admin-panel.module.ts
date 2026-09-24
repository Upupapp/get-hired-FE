import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { A11yModule } from '@angular/cdk/a11y';
import { AdminPanelComponent } from './admin-panel.component';
import { RouterModule, Routes } from '@angular/router';
import { AdminSidebarComponent } from './admin-sidebar/admin-sidebar.component';
import { CoreModule } from '@app-core/core.module';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AuthFacade } from '@main/auth/state/auth.facade';
import { AdminFacade } from './state/admin.facade';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { AdminEffects } from './state/admin.effects';
import { adminReducer } from './state/admin.reducer';
import { AdminUsersComponent } from './admin-users/admin-users.component';
import { AdminJobsComponent } from './admin-jobs/admin-jobs.component';
import { AdminCompaniesComponent } from './admin-companies/admin-companies.component';
import { AdminCompanyDetailComponent } from './admin-company-detail/admin-company-detail.component';
import { AdminApplicationsComponent } from './admin-applications/admin-applications.component';
import { AdminJobAlertsComponent } from './admin-job-alerts/admin-job-alerts.component';
import { AdminFinanceComponent } from './admin-finance/admin-finance.component';
import { AdminEmailVerifyComponent } from './admin-email-verify/admin-email-verify.component';
import { AdminTimeFilterComponent } from './admin-time-filter/admin-time-filter.component';
import { AdminNavIconComponent } from './admin-nav-icon/admin-nav-icon.component';
import { AdminPagerComponent } from './admin-pager/admin-pager.component';
import { AdminStatusComponent } from './admin-status/admin-status.component';

const routes: Routes = [
  {
    path: '',
    component: AdminPanelComponent,
    children: [
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'users', component: AdminUsersComponent },
      { path: 'jobs', component: AdminJobsComponent },
      { path: 'companies', component: AdminCompaniesComponent },
      { path: 'companies/:companyId', component: AdminCompanyDetailComponent },
      { path: 'applications', component: AdminApplicationsComponent },
      { path: 'job-alerts', component: AdminJobAlertsComponent },
      { path: 'finance', component: AdminFinanceComponent },
      {
        path: 'tools',
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'email-verify' },
          { path: 'email-verify', component: AdminEmailVerifyComponent },
        ]
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  declarations: [
    AdminPanelComponent,
    AdminSidebarComponent,
    AdminDashboardComponent,
    AdminUsersComponent,
    AdminJobsComponent,
    AdminCompaniesComponent,
    AdminCompanyDetailComponent,
    AdminApplicationsComponent,
    AdminJobAlertsComponent,
    AdminFinanceComponent,
    AdminEmailVerifyComponent,
    AdminTimeFilterComponent,
    AdminNavIconComponent,
    AdminPagerComponent,
    AdminStatusComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    A11yModule,
    CoreModule,
    RouterModule.forChild(routes),
    StoreModule.forFeature('admin', adminReducer),
    EffectsModule.forFeature([AdminEffects]),
  ],
  providers: [AuthFacade, AdminFacade ],
})
export class AdminPanelModule { }
