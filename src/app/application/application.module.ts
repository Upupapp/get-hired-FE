import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@app-shared/shared.module';
import { ApplicantModule } from '@app-applicant/applicant.module';
import { ApplicantFacade } from '@app-applicant/state/applicant.facade';
import { ApplicationProcessComponent } from './application-process/application-process.component';
import { ProfileDocumentsComponent } from './application-process/steps/profile-documents/profile-documents.component';
import { InterviewQuestionsComponent } from './application-process/steps/interview-questions/interview-questions.component';
import { ApplicationPreviewComponent } from './application-process/steps/application-preview/application-preview.component';
import { InterviewNotificationComponent } from './application-process/steps/interview-questions/components/interview-notification/interview-notification.component';
import { JobDetailsAnswerInterviewComponent } from './application-process/steps/interview-questions/components/job-details-answer-interview/job-details-answer-interview.component';
import { RecordInterviewComponent } from './application-process/steps/interview-questions/components/record-interview/record-interview.component';
import { SettingsModalComponent } from './application-process/steps/interview-questions/components/settings-modal/settings-modal.component';
import { InterviewModule } from '@main/interview/interview.module';
import { RecorderModule } from '@main/recorder/recorder.module';

const exportedComponent = [
  ApplicationProcessComponent,
  ProfileDocumentsComponent,
  InterviewQuestionsComponent,
  ApplicationPreviewComponent,

  InterviewNotificationComponent,
  JobDetailsAnswerInterviewComponent,
  RecordInterviewComponent,
  SettingsModalComponent
];

@NgModule({
  declarations: [
    ...exportedComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ApplicantModule,
    InterviewModule,
    RecorderModule
  ],
  exports: [
   ...exportedComponent
  ],
  providers: [ApplicantFacade]
})
export class ApplicationModule { }
