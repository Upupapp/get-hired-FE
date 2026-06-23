import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApplicantProfileFormComponent } from './applicant-profile-form/applicant-profile-form.component';
import { ApplicantProfileDetailsComponent } from './applicant-profile-details/applicant-profile-details.component';
import { ApplicantModule } from '@main/applicant/applicant.module';
import { RouterModule, Routes } from '@angular/router';
import { CvBuilderShellComponent } from '@app-applicant/cv-builder/cv-builder-shell.component';

const routes: Routes = [
  { path: 'details', component: ApplicantProfileDetailsComponent },
  { path: 'edit', component: ApplicantProfileFormComponent },
  // CVCOACH (v2 Product OS) -- per the registered architecture's
  // recommended route.
  { path: 'cv-builder', component: CvBuilderShellComponent },
  { path: '', redirectTo: 'details', pathMatch: 'full' }
]

const exportedComponents = [
  ApplicantProfileFormComponent,
  ApplicantProfileDetailsComponent,
  CvBuilderShellComponent
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
