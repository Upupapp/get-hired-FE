import { Routes } from '@angular/router';
import { AdminGuard } from './admin.guard';
import { ApplicantGuard } from './applicant.guard';
import { EmployerGuard } from './employer.guard';

const referralBunnyRoute = { path: 'integrations/referral-bunny', loadChildren: () => import('../../integrations/referral-bunny/referral-bunny.module').then(m => m.ReferralBunnyModule) };

export const adminRoutes: Routes = [
  referralBunnyRoute,
  {
    path: 'admin',
    loadChildren: () => import('@main/admin-panel/admin-panel.module').then(m => m.AdminPanelModule),
    // canActivate: [AdminGuard],
    data: { name: "admin" }
  },
  // No-dead-end fix: each role's swapped-in route table (via
  // router.resetConfig in the guards below) previously had no wildcard
  // entry -- an unmatched URL while signed in had nowhere to fall through
  // to (Angular just fails to match, no navigation happens). Redirects
  // back to this role's own root rather than the existing app-wide 404
  // page, since /** here is post-login and the 404 page's own route isn't
  // part of this swapped-in table at all.
  { path: '**', redirectTo: 'admin' },
];

export const employerRoutes: Routes = [
  referralBunnyRoute,
  {
    path: '',
    loadChildren: () => import('@main/employer-panel/employer-panel.module').then(m => m.EmployerPanelModule),
    // canActivate: [EmployerGuard],
    data: { name: "employer" }
  },
  { path: '**', redirectTo: '' }
]

export const applicantRoutes: Routes = [
  referralBunnyRoute,
  {
    path: '',
    loadChildren: () =>
      import('@main/applicant-panel/applicant-panel.module').then(m => m.ApplicantPanelModule),
    // canActivate: [ApplicantGuard],
    data: { name: "applicant" }
  },
  { path: '**', redirectTo: '' }
];

export const authRoutes: Routes = [
  referralBunnyRoute,
  {
    path: '',
    loadChildren: () => import('@main/auth/auth.module').then(m => m.AuthModule),
    data: { name: "auth" }
  },
  { path: '**', redirectTo: '' }
];
