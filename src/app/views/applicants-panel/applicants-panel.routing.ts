import { Routes } from '@angular/router';
//import { ApplicantPanelComponent } from './applicants-panel.component';
import { ApplicantGuard } from '@app-shared/guard/auth/applicant.guard';
import { ApplicantsPanelComponent } from './applicants-panel.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { JobsOpeningComponent } from './pages/jobs-opening/jobs-opening.component';
import { InboxComponent } from './pages/inbox/inbox.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { UpdateProfileComponent } from './pages/update-profile/update-profile.component';

export const ApplicantsPanelRoutes: Routes = [
  {
    path: '',
    redirectTo: 'profile',
    pathMatch: 'full'
  },
  { 
    path: '', 
    component: ApplicantsPanelComponent,
    canActivate: [ApplicantGuard],
    children: [
      {
        path: 'dashboard',  
        component: DashboardComponent
      },     

      {
        path: 'jobs',  
        component: JobsOpeningComponent
      },    

      {
        path: 'inbox',  
        component: InboxComponent
      },    

      {
        path: 'profile',  
        component: ProfileComponent
      },   

      {
        path: 'edit/details',  
        component: UpdateProfileComponent
      },  

      {
        path: 'settings',  
        component: SettingsComponent
      },    
    ]
  },
];
