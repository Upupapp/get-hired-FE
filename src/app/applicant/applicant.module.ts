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
import { WorkExperienceComponent } from './profile-forms/skills-experience/work-experience/work-experience.component';
import { EducationalBackgroundComponent } from './profile-forms/skills-experience/educational-background/educational-background.component';
import { AwardsComponent } from './profile-forms/skills-experience/awards/awards.component';
import { RecorderModule } from '@main/recorder/recorder.module';
import { PreviewComponent } from './profile-details/preview/preview.component';
import { ProfileBasicInfoComponent } from './profile-forms/profile-basic-info/profile-basic-info.component';
import { ProfileFormsComponent } from './profile-forms/profile-forms.component';
import { SkillsExperienceComponent } from './profile-forms/skills-experience/skills-experience.component';
import { DocsVideocvComponent } from './profile-forms/docs-videocv/docs-videocv.component';


@NgModule({
  declarations: [
    ProfileDetailsComponent,
    DetailsComponent,
    AvatarComponent,
    WorkExperienceComponent,
    EducationalBackgroundComponent,
    AwardsComponent,
    PreviewComponent,
    ProfileBasicInfoComponent,
    ProfileFormsComponent,
    SkillsExperienceComponent,
    DocsVideocvComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    RecorderModule,
    StoreModule.forFeature('applicant', applicantReducer),
    EffectsModule.forFeature([ApplicantEffects])
  ],
  exports: [
    ProfileFormsComponent,
    ProfileDetailsComponent,
    AvatarComponent,
    DetailsComponent
  ],
  providers: [FormGroupDirective, ApplicantFacade, DatePipe]
})
export class ApplicantModule { }
