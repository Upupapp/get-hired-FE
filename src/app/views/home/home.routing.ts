import { Routes } from '@angular/router';
import { JobPostDetailsComponent } from './pages/job-post-details/job-post-details.component';
import { JobPostDetailsApplyComponent } from './pages/job-post-details-apply/job-post-details-apply.component';
import { JobPostDetailsAnswerQuestionComponent } from './pages/job-post-details-answer-question/job-post-details-answer-question.component';
import { JobPostsComponent } from './pages/job-posts/job-posts.component';

export const HomeRoutes: Routes = [
  { path: '', component: JobPostsComponent },
  { path: 'details/:id', component: JobPostDetailsComponent },
  { path: 'apply/:id', component: JobPostDetailsApplyComponent },
];
