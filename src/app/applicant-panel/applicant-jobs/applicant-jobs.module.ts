import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@app-shared/shared.module';
import { StoreModule } from '@ngrx/store';
import { NgChartsModule } from 'ng2-charts';
import { RouterModule, Routes } from '@angular/router';
import { ApplicantJobsComponent } from './applicant-jobs.component';
import { applicantJobsReducer } from './state/applicant-jobs.reducer';
import { EffectsModule } from '@ngrx/effects';
import { ApplicantJobsEffects } from './state/applicant-jobs.effects';
import { ApplicantJobsFacade } from './state/applicant-jobs.facade';
const routes: Routes = [
  { path: '', component: ApplicantJobsComponent }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SharedModule,
    NgChartsModule,
    RouterModule.forChild(routes),
    StoreModule.forFeature('applicantJobs', applicantJobsReducer),
    EffectsModule.forFeature([ApplicantJobsEffects]),
  ], 
  providers: [ApplicantJobsFacade]
})
export class ApplicantJobsModule { }
