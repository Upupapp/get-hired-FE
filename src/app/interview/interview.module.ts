import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateQuestionComponent } from './create-question/create-question.component';
import { SharedModule } from '@app-shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { ViewInterviewQuestionComponent } from './view-interview-question/view-interview-question.component';
import { UpdateQuestionComponent } from './update-question/update-question.component';

const exportedComponents = [
  CreateQuestionComponent,
  ViewInterviewQuestionComponent,
  UpdateQuestionComponent
]

@NgModule({
  declarations: [
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
