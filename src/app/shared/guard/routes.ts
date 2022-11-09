import { Routes } from '@angular/router';
import { AdminGuard } from './admin.guard';
import { ApplicantGuard } from './applicant.guard';
import { EmployerGuard } from './employer.guard';

export const adminRoutes: Routes = [
  {
    path: 'admin',
    loadChildren: () => import('@main/admin-panel/admin-panel.module').then(m => m.AdminPanelModule),
    // canActivate: [AdminGuard],
    data: { name: "admin" }
  },
  ,
];

export const employerRoutes: Routes = [
  {
    path: '',
    loadChildren: () => import('@main/employer-panel/employer-panel.module').then(m => m.EmployerPanelModule),
    // canActivate: [EmployerGuard],
    data: { name: "employer" }
  }
]

export const applicantRoutes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('@main/applicant-panel/applicant-panel.module').then(m => m.ApplicantPanelModule),
    // canActivate: [ApplicantGuard],
    data: { name: "applicant" }
  }
];

export const authRoutes: Routes = [
  {
    path: '',
    loadChildren: () => import('@main/auth/auth.module').then(m => m.AuthModule),
    data: { name: "auth" }
  }
];
