import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { environment } from '../../../../environments/environment';
import { ApplicantsRoutes } from './applicant.routing';
import { ApplicantSigninComponent } from './applicant-signin/applicant-signin.component';
import { ApplicantSignupComponent } from './applicant-signup/applicant-signup.component';
import { ApplicantProfileComponent } from './applicant-profile/applicant-profile.component';
import { SharedModule } from '../../../shared/shared.module';
import { MaterialComponentsModule } from '@app-shared/components/material-components/material-components.module';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

@NgModule({
  imports: [
    CommonModule,
    FormsModule, 
    ReactiveFormsModule,
    SharedModule,
    MaterialComponentsModule,
    EffectsModule,
    StoreModule,
    RouterModule.forChild(ApplicantsRoutes)
  ],
  declarations: [
    ApplicantSigninComponent,
    ApplicantSignupComponent,
    ApplicantProfileComponent
  ]
})
export class ApplicantsModule { }
