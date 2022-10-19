import { Routes } from '@angular/router';
import { CompanyPanelComponent } from './company-panel.component';
import { CompanyGuard } from '@app-shared/guard/auth/company.guard';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { JobsComponent } from './pages/jobs/jobs.component';
import { CreateJobPostComponent } from './pages/jobs/pages/create-job-post/create-job-post.component';

import { ApplicantsComponent } from './pages/applicants/applicants.component';
import { AccountDetailsComponent } from './pages/account-details/account-details.component';
import { ExpiredJobsComponent } from './pages/expired-jobs/expired-jobs.component';
import { CreateInterviewComponent } from './pages/create-interview/create-interview.component';

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
        children: [
          {
            path: '',  
            component: JobsComponent,
          },
          {
            path: 'create',  
            component: CreateJobPostComponent
          }
        ]
      },

      {
        path: 'applicants',  
        component: ApplicantsComponent
      },

      {
        path: 'interview-settings',  
        component: CreateInterviewComponent
      },

      {
        path: 'account-details',  
        component: AccountDetailsComponent
      },

      {
        path: 'expired-jobs',  
        component: ExpiredJobsComponent
      },
    ]
  },
];
