import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApplicantProfileFormComponent } from './applicant-profile-form/applicant-profile-form.component';
import { ApplicantProfileDetailsComponent } from './applicant-profile-details/applicant-profile-details.component';
import { ApplicantModule } from '@main/applicant/applicant.module';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: 'details', component: ApplicantProfileDetailsComponent }
]

const exportedComponents = [
  ApplicantProfileFormComponent,
  ApplicantProfileDetailsComponent
];

@NgModule({
  declarations: [
    ...exportedComponents
  ],
  imports: [
    CommonModule,
    ApplicantModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    ...exportedComponents
  ]
})
export class ApplicantProfileModule { }
