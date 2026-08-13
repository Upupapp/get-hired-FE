import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroupDirective } from '@angular/forms';
import { SharedModule } from '@app-shared/shared.module';
import { ApplicantModule } from '@app-applicant/applicant.module';
import { ApplicationPreviewComponent } from './application-process/steps/application-preview/application-preview.component';

// Employer-only extraction of the one component from application/ that
// employer screens genuinely need (confirmed by build experiment: both
// employer-contacts' candidate-list and job/'s job-applicants use exactly
// this component, nothing else from application/).
//
// providers: [FormGroupDirective] replicates the exact mechanism
// applicant.module.ts uses (see applicant.module.ts:53) to satisfy this
// component's constructor-injected FormGroupDirective without a real
// <form> ancestor. Verified via a headless-browser TestBed run in the
// disposable experiment worktree: providing FormGroupDirective as a plain
// module-level provider (not a real form) resolves the dependency and the
// component instantiates successfully. This is not a behavioral change —
// it reproduces the identical resolution path the component already runs
// through today via application.module.ts -> ApplicantModule.
@NgModule({
  declarations: [ApplicationPreviewComponent],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    ApplicantModule,
  ],
  exports: [ApplicationPreviewComponent],
  providers: [FormGroupDirective],
})
export class ApplicationPreviewModule { }
