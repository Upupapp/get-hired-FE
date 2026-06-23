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
import { StoreModule } from '@ngrx/store';
import { applicantReducer } from '@main/applicant/state/applicant.reducer';
import { EffectsModule } from '@ngrx/effects';
import { ApplicantEffects } from '@main/applicant/state/applicant.effects';
import { ApplicantFacade } from '@main/applicant/state/applicant.facade';
import { AuthModule } from '@main/auth/auth.module';
import { ApplicantModule } from '@main/applicant/applicant.module';
import { ReactiveFormsModule } from '@angular/forms';
import { ApplicationModule } from '@main/application/application.module';
import { SharedModule } from '@app-shared/shared.module';
import { ApplicantJobsComponent } from './applicant-jobs/applicant-jobs.component';
import { ApplicantApplicationsComponent } from './applicant-applications/applicant-applications.component';

const routes: Routes = [
  {
    path: '',
    component: ApplicantPanelComponent,
    children: [
      // {
      //   path: 'apply', component: ApplicantApplicationComponent
      // },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./applicant-dashboard/applicant-dashboard.module').then(
            (m) => m.ApplicantDashboardModule
          ),
      },
      {
        path: 'profile',
        loadChildren: () =>
          import('./applicant-profile/applicant-profile.module').then(
            (m) => m.ApplicantProfileModule
          ),
      },
      // GH-ACT applicant-experience: real navigation entry per the
      // requested Tab/Subtab map, with an honest empty/error state -- see
      // GETHIRED_APPLICANT_DATA_MODEL_AUDIT.md for why this can't show
      // populated data yet (job_applicants table doesn't exist).
      {
        path: 'applications',
        component: ApplicantApplicationsComponent,
      },
      {
        path: 'settings',
        component: ApplicantSettingsComponent,
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  declarations: [
    ApplicantPanelComponent,
    ApplicantSidebarComponent,
    ApplicantSettingsComponent,
    ApplicantJobsComponent,
    ApplicantApplicationsComponent,
  ],
  imports: [
    CommonModule,
    CoreModule,
    ApplicantModule,
    ReactiveFormsModule,
    ApplicationModule,
    SharedModule,
    RouterModule.forChild(routes),
    // StoreModule.forFeature('applicant', applicantReducer),
    // EffectsModule.forFeature([ApplicantEffects]),
    // AuthModule
  ],
  providers: [AuthFacade, ApplicantFacade, ApplicantEffects],
})
export class ApplicantPanelModule {}
