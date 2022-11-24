import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileDetailsComponent } from './profile-details/profile-details.component';
import { DetailsComponent } from './profile-details/components/details/details.component';
import { AvatarComponent } from './profile-details/components/avatar/avatar.component';
import { ProfileFormComponent } from './profile-form/profile-form.component';



@NgModule({
  declarations: [
    ProfileDetailsComponent,
    DetailsComponent,
    AvatarComponent,
    ProfileFormComponent
  ],
  imports: [
    CommonModule
  ],
  exports:[ProfileDetailsComponent]
})
export class ApplicantModule { }
