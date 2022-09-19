import { Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { JobPostDetailsComponent } from './pages/job-post-details/job-post-details.component';

export const HomeRoutes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'details/:id', component: JobPostDetailsComponent },
];
