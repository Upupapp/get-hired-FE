import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@app-shared/shared.module';
import { CreateQuestionComponent } from './create-question/create-question.component';
import { UpdateQuestionComponent } from './update-question/update-question.component';

// Employer-only half of the original InterviewModule: question authoring.
// See GETHIRED_FRONTEND_SEPARATION_DEPENDENCY_PLAN.md §3 / §14 for why this
// exists alongside interview.module.ts rather than replacing it outright —
// application/ (not yet extracted from this worktree) still depends on
// interview.module.ts's ViewInterviewQuestionComponent, so that module is
// left intact. This module is additive, scoped to job/'s own direct need.
const exportedComponents = [
  CreateQuestionComponent,
  UpdateQuestionComponent
];

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
export class InterviewAuthoringModule { }
