import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApplicantPanelComponent } from './applicant-panel.component';
import { RouterModule, Routes } from '@angular/router';
import { ApplicantDashboardComponent } from './applicant-dashboard/applicant-dashboard.component';
import { ApplicantGuard } from '@app-shared/guard/applicant.guard';
import { CoreModule } from '@app-core/core.module';
import { ApplicantSidebarComponent } from './applicant-sidebar/applicant-sidebar.component';
import { ApplicantSettingsComponent } from './applicant-settings/applicant-settings.component';
import { AuthFacade } from '@main/auth/state/auth.facade';
import { AuthModule } from '@main/auth/auth.module';

const routes: Routes = [
  {
    path: '',
    component: ApplicantPanelComponent,
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./applicant-dashboard/applicant-dashboard.module')
          .then(m => m.ApplicantDashboardModule)
      },
      {
        path: 'profile',
        loadChildren: () => import('./applicant-profile/applicant-profile.module').then(m => m.ApplicantProfileModule),
      },
      {
        path: 'settings', component: ApplicantSettingsComponent
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
]

@NgModule({
  declarations: [
    ApplicantPanelComponent,
    ApplicantSidebarComponent,
    ApplicantSettingsComponent
  ],
  imports: [
    CommonModule,
    CoreModule,
    // AuthModule,
    RouterModule.forChild(routes)
  ],
  providers: [AuthFacade]
})
export class ApplicantPanelModule { }
