import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployerInterviewComponent } from './employer-interview.component';
import { SharedModule } from '@app-shared/shared.module';
import { RouterModule, Routes } from '@angular/router';

import { AddInterviewTemplatesComponent } from './pages/add-interview-templates/add-interview-templates.component';
import { InterviewTemplateStepComponent } from './pages/add-interview-templates/components/interview-template-step/interview-template-step.component';
import { CreateNewTemplateDialogComponent } from './pages/add-interview-templates/components/create-new-template-dialog/create-new-template-dialog.component';
import { InviteContactComponent } from './pages/add-interview-templates/components/invite-contact/invite-contact.component';
import { EmployerInterviewListComponent } from './employer-interview-list/employer-interview-list.component';
import { InterviewModule } from '@main/interview/interview.module';
import { EmployerInterviewQuestionTemplatesComponent } from './employer-interview-question-templates/employer-interview-question-templates.component';
import { EmployerInterViewBasicInfoComponent } from './employer-inter-view-basic-info/employer-inter-view-basic-info.component';
import { EmployerInterviewCreateTemplateComponent } from './employer-interview-create-template/employer-interview-create-template.component';

const routes: Routes = [
  {
    path: '',
    component: EmployerInterviewComponent,
    children: [
      {
        path: 'list',
        component: EmployerInterviewListComponent
      },
      {
        path: 'create',
        component: EmployerInterViewBasicInfoComponent,
      },
      { path: 'question-template', component: EmployerInterviewCreateTemplateComponent },
      {
        path: 'templates',
        component: EmployerInterviewQuestionTemplatesComponent,
      },
      { path: '', redirectTo: 'list', pathMatch: 'full' }
    ]
  },
]

@NgModule({
  declarations: [
    EmployerInterviewListComponent,
    EmployerInterviewComponent,
    AddInterviewTemplatesComponent,
    InterviewTemplateStepComponent,
    CreateNewTemplateDialogComponent,
    InviteContactComponent,
    EmployerInterviewQuestionTemplatesComponent,
    EmployerInterViewBasicInfoComponent,
    EmployerInterviewCreateTemplateComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    InterviewModule,
    RouterModule.forChild(routes)
  ]
})
export class EmployerInterviewModule { }
