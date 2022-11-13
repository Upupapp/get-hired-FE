import { APP_INITIALIZER, NgModule } from '@angular/core';
import { ActivatedRoute, Router, RouterModule, ROUTES, Routes } from '@angular/router';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { AuthGuard } from '@app-shared/guard/auth.guard'
import { EmployerGuard } from './shared/guard/employer.guard';
import { ApplicantGuard } from './shared/guard/applicant.guard';
import { UnauthGuard } from './shared/guard/unauth.guard';
import { AdminGuard } from './shared/guard/admin.guard';

export const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () => import('@main/admin-panel/admin-panel.module').then(m => m.AdminPanelModule),
    canActivate: [AuthGuard],
    data: {
      role: '1'
    }
  },
  {
    path: 'recruiter',
    loadChildren: () => import('./employer-panel/employer-panel.module').then(m => m.EmployerPanelModule),
    canActivate: [AuthGuard],
    data: {
      role: '2'
    }
  },
  {
    path: 'user',
    loadChildren: () =>
      import('./applicant-panel/applicant-panel.module').then(m => m.ApplicantPanelModule),
    canActivate: [AuthGuard],
    data: { role: '3' }
  },
  {
    path: '',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule),
    canActivate: [UnauthGuard],
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
