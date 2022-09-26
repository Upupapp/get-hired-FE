import { Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { JobPostDetailsComponent } from './pages/job-post-details/job-post-details.component';
import { JobPostDetailsApplyComponent } from './pages/job-post-details-apply/job-post-details-apply.component';
import { JobPostDetailsAnswerQuestionComponent } from './pages/job-post-details-answer-question/job-post-details-answer-question.component';

export const HomeRoutes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'details/:id', component: JobPostDetailsComponent },
  { path: 'apply/:id', component: JobPostDetailsApplyComponent },
  { path: 'answer-interview/:id/:question-id', component: JobPostDetailsAnswerQuestionComponent },
];
