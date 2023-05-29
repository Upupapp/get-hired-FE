import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@app-shared/shared.module';
import { InterviewDetailsComponent } from './pages/interview-details/interview-details.component';
import { InterviewListComponent as ApplicantInterviewList } from './pages/interview-list/interview-list.component';
import { ApplicantInterviewComponent } from './applicant-interview.component';

import { NgChartsModule } from 'ng2-charts';
import { RouterModule, Routes } from '@angular/router';
import { DetailDialogComponent } from './pages/interview-list/components/detail-dialog/detail-dialog.component';

import { JobDetailsAnswerInterviewComponent } from './pages/interview-details/components/job-details-answer-interview/job-details-answer-interview.component';
import { RecordInterviewComponent } from './pages/interview-details/components/record-interview/record-interview.component';
import { SettingsModalComponent } from './pages/interview-details/components/settings-modal/settings-modal.component';
import { RecorderModule } from '@main/recorder/recorder.module';
import { InterviewModule } from '@main/interview/interview.module';

const routes: Routes = [
  { 
    path: '', 
    component: ApplicantInterviewComponent,
    children: [
      {
        path: '',
        component: ApplicantInterviewList
      },

      {
        path: 'details/:id',
        component: InterviewDetailsComponent
      },
    ]

  }
];

@NgModule({
  declarations: [
    ApplicantInterviewList,
    InterviewDetailsComponent,
    DetailDialogComponent,
    JobDetailsAnswerInterviewComponent,
    RecordInterviewComponent,
    SettingsModalComponent
  ],
  imports: [
    CommonModule,
    InterviewModule,
    SharedModule,
    RecorderModule,
    NgChartsModule,
    RouterModule.forChild(routes)
  ]
})
export class ApplicantInterviewModule { }
