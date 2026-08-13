import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { DetailsComponent } from './profile-details/components/details/details.component';
import { AvatarComponent } from './profile-details/components/avatar/avatar.component';
import { SharedModule } from '@app-shared/shared.module';
import { ProfileDetailsComponent } from './profile-details/profile-details.component';
import { FormGroupDirective, ReactiveFormsModule } from '@angular/forms';
import { ApplicantFacade } from './state/applicant.facade';
import { applicantReducer } from './state/applicant.reducer';
import { ApplicantEffects } from './state/applicant.effects';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { PreviewComponent } from './profile-details/preview/preview.component';

// Employer-only extraction (2026-08-12): profile-forms/ (edit-forms family
// -- ProfileBasicInfoComponent, SkillsExperienceComponent + its
// work-experience/educational-background/awards children,
// DocsVideocvComponent) and cv-builder/ are applicant-editing-their-own-
// profile UI, confirmed used only by applicant-panel/ (job-seeker-only,
// removed from this worktree). Employer screens (employer-contacts'
// candidate-list, job's job-applicants) only ever consumed
// ProfileDetailsComponent/AvatarComponent/DetailsComponent -- read-only
// display, kept here. RecorderModule dropped: its only consumer in this
// module was the now-removed DocsVideocvComponent.
@NgModule({
  declarations: [
    ProfileDetailsComponent,
    DetailsComponent,
    AvatarComponent,
    PreviewComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    StoreModule.forFeature('applicant', applicantReducer),
    EffectsModule.forFeature([ApplicantEffects])
  ],
  exports: [
    ProfileDetailsComponent,
    AvatarComponent,
    DetailsComponent
  ],
  providers: [FormGroupDirective, ApplicantFacade, DatePipe]
})
export class ApplicantModule { }
