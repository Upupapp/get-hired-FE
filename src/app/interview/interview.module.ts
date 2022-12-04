import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateInterviewComponent } from './create-interview/create-interview.component';
import { CreateQuestionComponent } from './create-question/create-question.component';
import { SharedModule } from '@app-shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { ViewInterviewQuestionComponent } from './view-interview-question/view-interview-question.component';

const exportedComponents = [
  CreateQuestionComponent,
  ViewInterviewQuestionComponent
]

@NgModule({
  declarations: [
    CreateInterviewComponent,
    ...exportedComponents,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule
  ],
  exports: [
    ...exportedComponents
  ]
})
export class InterviewModule { }
