import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { A11yModule } from '@angular/cdk/a11y';
import { ApplicantPanelComponent } from './applicant-panel.component';
import { RouterModule, Routes } from '@angular/router';
import { ApplicantDashboardComponent } from './applicant-dashboard/applicant-dashboard.component';
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
import { ApplicantApplicationDetailComponent } from './applicant-application-detail/applicant-application-detail.component';
import { ApplicantMessagesComponent } from './applicant-messages/applicant-messages.component';

const routes: Routes = [
  // SIGNOUT ROUTECONFIG-CORRUPTION FIX: canActivate: [ApplicantGuard] removed.
  // That was a SECOND, legacy guard (src/app/shared/guard/applicant.guard.ts,
  // distinct from the modern AuthGuard already protecting the parent /user
  // route in app.routing.module.ts) stacked redundantly on top of it -- and
  // it called router.resetConfig([...]) as a side effect of its own auth
  // check, which globally REPLACES the entire app's route table at runtime.
  // Once triggered, that mutated (partial) route config persists for the
  // rest of the SPA session -- only a true page reload re-reads the real,
  // full table from app.routing.module.ts. This was the mechanism behind
  // "sign out doesn't work until I hard-refresh": AuthGuard already handles
  // this route correctly, without ever mutating global router state, so
  // this legacy duplicate is removed rather than patched.
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
        path: 'applications/:id',
        component: ApplicantApplicationDetailComponent,
      },
      {
        path: 'settings',
        component: ApplicantSettingsComponent,
      },
      // GH-ACT jobseeker Messages tab -- applicant-side equivalent of the
      // employer portal's /recruiter/messages inbox (recruiter-messages
      // component), reusing the same message.service.ts / app-message-thread.
      {
        path: 'messages',
        component: ApplicantMessagesComponent,
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
    ApplicantApplicationDetailComponent,
    ApplicantMessagesComponent,
  ],
  imports: [
    CommonModule,
    A11yModule,
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
