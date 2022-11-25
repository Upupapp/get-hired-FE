import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DetailsComponent } from './profile-details/components/details/details.component';
import { AvatarComponent } from './profile-details/components/avatar/avatar.component';
import { ProfileFormComponent } from './profile-form/profile-form.component';
import { SharedModule } from '@app-shared/shared.module';
import { ProfileDetailsComponent } from './profile-details/profile-details.component';
import { ProfileDetailsFormComponent } from './profile-form/components/profile-details-form/profile-details-form.component';
import { FormGroupDirective, ReactiveFormsModule } from '@angular/forms';




@NgModule({
  declarations: [
    ProfileDetailsComponent,
    DetailsComponent,
    AvatarComponent,
    ProfileFormComponent,
    ProfileDetailsFormComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule
  ],
  exports:[ProfileDetailsComponent, ProfileFormComponent],
  providers:[FormGroupDirective]
})
export class ApplicantModule { }
