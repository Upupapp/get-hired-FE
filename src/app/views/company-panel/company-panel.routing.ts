import { Routes } from '@angular/router';
import { CompanyPanelComponent } from './company-panel.component';
import { CompanyGuard } from '@app-shared/guard/auth/company.guard';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { JobsComponent } from './pages/jobs/jobs.component';
import { CreateJobPostComponent } from './pages/jobs/pages/create-job-post/create-job-post.component';

import { ApplicantsComponent } from './pages/applicants/applicants.component';
import { ApplicantDetailsComponent } from './pages/applicants/pages/applicant-details/applicant-details.component';

import { AccountDetailsComponent } from './pages/account-details/account-details.component';
import { ExpiredJobsComponent } from './pages/expired-jobs/expired-jobs.component';
import { CreateInterviewComponent } from './pages/create-interview/create-interview.component';
import { MySubscriptionComponent } from './pages/my-subscription/my-subscription.component';
import { ContactListComponent } from './pages/contact-list/contact-list.component';

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
        
        children: [
          {
            path: '',  
            component: ApplicantsComponent,
          },

           {
            path: 'details/:id',  
            component: ApplicantDetailsComponent,
          },

          {
            path: 'contact-list',  
            component: ContactListComponent,
          },
        ]

      },
     
      {
        path: 'interview-settings',  
        component: CreateInterviewComponent
      },

      {
        path: 'my-subscription',  
        component: MySubscriptionComponent
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
