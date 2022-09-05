import { Routes } from '@angular/router';
import { CompanyPanelComponent } from './company-panel.component';
import { CompanyGuard } from '@app-shared/guard/auth/company.guard';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { JobsComponent } from './pages/jobs/jobs.component';
import { ApplicantsComponent } from './pages/applicants/applicants.component';
import { AccountDetailsComponent } from './pages/account-details/account-details.component';

export const CompanyPanelRoutes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  { 
    path: '', 
    component: CompanyPanelComponent,
    canActivate: [CompanyGuard],
    children: [
      {
        path: 'dashboard',  
        component: DashboardComponent
      },

      {
        path: 'jobs',  
        component: JobsComponent
      },

      {
        path: 'applicants',  
        component: ApplicantsComponent
      },

      {
        path: 'account-details',  
        component: AccountDetailsComponent
      },
    ]
  },
];
