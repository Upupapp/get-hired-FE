import { APP_INITIALIZER, NgModule } from '@angular/core';
import { ActivatedRoute, Router, RouterModule, ROUTES, Routes } from '@angular/router';
import { HeaderComponent } from './shared/components/header-bak/header.component.bak';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { AuthGuard } from '@app-shared/guard/auth.guard'
import { EmployerGuard } from './shared/guard/employer.guard';
import { ApplicantGuard } from './shared/guard/applicant.guard';
import { CoreService } from './core/services/core.service';
import { UnauthGuard } from './shared/guard/unauth.guard';
import { AdminGuard } from './shared/guard/admin.guard';

const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () => import('@main/admin-panel/admin-panel.module').then(m => m.AdminPanelModule),
    data: { name: "admin" }
  },
  {
    path: '',
    loadChildren: () => import('./employer-panel/employer-panel.module').then(m => m.EmployerPanelModule),
    canActivate: [AuthGuard],
    data: { name: "employer" }
  },
  {
    path: '',
    loadChildren: async () =>
      import('./applicant-panel/applicant-panel.module').then(m => m.ApplicantPanelModule),
    canActivate: [AuthGuard],
    data: { name: "applicant" }
  },
  {
    path: '',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule),
    canActivate: [UnauthGuard],
    data: { name: "auth" }
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
