import { Routes } from '@angular/router';
import { JobPostDetailsComponent } from './pages/job-post-details/job-post-details.component';
import { JobPostDetailsApplyComponent } from './pages/job-post-details-apply/job-post-details-apply.component';
import { JobPostsComponent } from './pages/job-posts/job-posts.component';
import { CompanyDetailsComponent } from './pages/company-details/company-details.component';
import { JobPostSearchListComponent } from './pages/job-post-search-list/job-post-search-list.component';

export const HomeRoutes: Routes = [
  { path: '', component: JobPostsComponent },
  { path: 'details/:id', component: JobPostDetailsComponent },
  { path: 'apply/:id', component: JobPostDetailsApplyComponent },
  { path: 'company/:name', component: CompanyDetailsComponent },
  { path: ':keyword', component: JobPostSearchListComponent },
  { path: ':keyword/:work_setup', component: JobPostSearchListComponent },
  { path: ':keyword/:work_setup/:job_type', component: JobPostSearchListComponent },
];
