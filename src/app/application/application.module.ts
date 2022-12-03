import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@app-shared/shared.module';
import { ApplicantModule } from '@app-applicant/applicant.module';
import { ApplicantFacade } from '@app-applicant/state/applicant.facade';
import { ApplicationProcessComponent } from './application-process/application-process.component';
import { ProfileDocumentsComponent } from './application-process/steps/profile-documents/profile-documents.component';
import { InterviewQuestionsComponent } from './application-process/steps/interview-questions/interview-questions.component';
import { ApplicationPreviewComponent } from './application-process/steps/application-preview/application-preview.component';

const exportedComponent = [
  ApplicationProcessComponent,
  ProfileDocumentsComponent,
  InterviewQuestionsComponent,
  ApplicationPreviewComponent
];

@NgModule({
  declarations: [
    ...exportedComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ApplicantModule
  ],
  exports: [
   ...exportedComponent
  ],
  providers: [ApplicantFacade]
})
export class ApplicationModule { }
