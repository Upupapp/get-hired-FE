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
import { CompanySettingsComponent } from './pages/company-settings/company-settings.component';
import { AddInterviewTemplatesComponent } from './pages/create-interview/pages/add-interview-templates/add-interview-templates.component';
import { CandidatesComponent } from './pages/candidates/candidates.component';
import { ViewJobPostComponent } from './pages/jobs/pages/view-job-post/view-job-post.component';

export const CompanyPanelRoutes: Routes = [
  // {
  //   path: '',
  //   redirectTo: 'dashboard',
  //   pathMatch: 'full'
  // },
  {
    path: '',
    component: CompanyPanelComponent,
    children: [
      // DASHBOARD
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      // JOB POSTS
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
          },

          {
            path: 'details/:job-id',
            component: ViewJobPostComponent,
          },

          {
            path: 'edit/:job-id',
            component: CreateJobPostComponent,
          },

          {
            path: ':job-id/applicants',
            component: ApplicantsComponent,
          },

           {
            path: ':job-id/applicants/details/:id',
            component: ApplicantDetailsComponent,
          },
        ]
      },

      {
        path: 'expired-jobs',
        component: ExpiredJobsComponent
      },

      // APPLICANTS
      {
        path: 'contact-list',
        children: [
          {
            path: '',
            component: ContactListComponent,
          },
          {
            path: 'candidates',
            component: CandidatesComponent,
          },

           {
            path: 'details/:id',
            component: ApplicantDetailsComponent,
          },
        ]
      },

      // INTERVIEW SETTINGS
      {
        path: 'create-interview',
        children: [
          {
            path: '',
            component: CreateInterviewComponent,
          },

          {
            path: 'template',
            component: AddInterviewTemplatesComponent,
          }
        ]
      },

      // SUBSCRIPTION
      {
        path: 'my-subscription',
        component: MySubscriptionComponent
      },

      // COMPANY DETAILS
      {
        path: 'company-details',
        component: AccountDetailsComponent
      },

      // COMPANY SETTINGS
      {
        path: 'settings',
        component: CompanySettingsComponent
      },
    ]
  },
];
