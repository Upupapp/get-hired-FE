import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@app-shared/shared.module';
// B03: RecruiterInterviewHub replaces the under-construction stub at /recruiter/interview
import { RecruiterInterviewHubComponent } from '../recruiter-interview-hub/recruiter-interview-hub.component';

const routes: Routes = [
  { path: '', component: RecruiterInterviewHubComponent }
]

@NgModule({
  declarations: [
    RecruiterInterviewHubComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class EmployerInterviewModule { }
