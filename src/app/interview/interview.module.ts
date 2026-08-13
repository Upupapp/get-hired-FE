import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@app-shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { ViewInterviewQuestionComponent } from './view-interview-question/view-interview-question.component';

// Narrowed from the original 3-component InterviewModule (authoring +
// viewing) to viewing only. CreateQuestionComponent/UpdateQuestionComponent
// moved to interview-authoring.module.ts. This module is kept under its
// original name/path because application/ (not yet extracted from this
// worktree) already imports InterviewModule from exactly this path for
// ViewInterviewQuestionComponent — no consumer edit needed for that side.
// A component cannot be declared in two NgModules at once (Angular NG6007),
// which is why Create/UpdateQuestionComponent had to be removed here rather
// than left duplicated alongside interview-authoring.module.ts.
const exportedComponents = [
  ViewInterviewQuestionComponent
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
