import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateQuestionComponent } from './create-question/create-question.component';
import { SharedModule } from '@app-shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { ViewInterviewQuestionComponent } from './view-interview-question/view-interview-question.component';
import { UpdateQuestionComponent } from './update-question/update-question.component';
import { InterviewListComponent } from './interview-list/interview-list.component';
import { CreateGroupInterviewComponent } from './create-group-interview/create-group-interview.component';
import { interviewReducer } from './state/interview.reducer';
import { InterviewEffects } from './state/interview.effects';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { InterviewFacade } from './state/interview.facade';
import { TemplateListComponent } from './template-list/template-list.component';
import { GroupInterviewSummaryComponent } from './group-interview-summary/group-interview-summary.component';
import { CreateInterviewComponent } from './create-interview/create-interview.component';

const exportedComponents = [
  CreateQuestionComponent,
  ViewInterviewQuestionComponent,
  UpdateQuestionComponent,
  CreateGroupInterviewComponent,
  TemplateListComponent,
  GroupInterviewSummaryComponent,
  InterviewListComponent,
  CreateInterviewComponent
]

@NgModule({
  declarations: [
    ...exportedComponents,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    StoreModule.forFeature('interview', interviewReducer),
    EffectsModule.forFeature([InterviewEffects]),
  ],
  exports: [
    ...exportedComponents
  ],
  providers: [InterviewFacade]
})
export class InterviewModule { }
