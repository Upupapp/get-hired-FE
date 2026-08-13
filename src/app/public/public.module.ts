import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PublicComponent } from './public.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@app-shared/shared.module';
import { CoreModule } from '@app-core/core.module';
import { EmployerPortalComponent } from './employer-portal/employer-portal.component';
import { PortalFaqComponent } from './shared/portal-faq/portal-faq.component';
import { AiJobPreviewPanelComponent } from './employer-portal/ai-job-preview-panel/ai-job-preview-panel.component';
import { PrivacyComponent } from './privacy/privacy.component';

// Employer-only extraction (2026-08-12): public-list/public-details/
// public-search (job board + inline apply flow), job-seeker-portal,
// companies/ (job-seeker's company directory), and jobs/'s job-seeker-only
// pieces are all removed -- confirmed job-seeker-only by trace, they live
// only in gethired-jobseeker-FE now. main-portal/ (the dual-audience
// role-selection landing) is also removed rather than cloned/rewritten:
// EmployerPortalComponent is already a complete, dedicated employer landing
// page (hero/USP/pain-points/features/FAQ/trust/how-it-works) and is what
// "/employers" already pointed to -- reusing it as this app's home avoids
// fabricating new marketing copy. Its "Browse public jobs" hero CTA
// (employer-portal.component.ts: browseJobs()) now cross-links to
// environment.jobSeekerAppUrl instead of an internal /jobs route that no
// longer exists in this app.
const routes: Routes = [
  {
    path: '',
    component: PublicComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: EmployerPortalComponent },
      { path: 'employers', component: EmployerPortalComponent },
      { path: 'privacy', component: PrivacyComponent },
    ]
  }
]

@NgModule({
  declarations: [
    PublicComponent,
    EmployerPortalComponent,
    PortalFaqComponent,
    AiJobPreviewPanelComponent,
    PrivacyComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    FormsModule,
    CoreModule,
    SharedModule,
  ]
})
export class PublicModule { }
