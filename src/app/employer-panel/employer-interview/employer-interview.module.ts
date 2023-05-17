import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployerInterviewComponent } from './employer-interview.component';
import { SharedModule } from '@app-shared/shared.module';
import { RouterModule, Routes } from '@angular/router';

import { AddInterviewTemplatesComponent } from './pages/add-interview-templates/add-interview-templates.component';
import { InterviewTemplateStepComponent } from './pages/add-interview-templates/components/interview-template-step/interview-template-step.component';
import { CreateNewTemplateDialogComponent } from './pages/add-interview-templates/components/create-new-template-dialog/create-new-template-dialog.component';
import { InviteContactComponent } from './pages/add-interview-templates/components/invite-contact/invite-contact.component';

const routes: Routes = [
  {
    path: '',  
    children: [
     {
       path: '',
       component: EmployerInterviewComponent
     },
     {
       path: 'create',  
       component: AddInterviewTemplatesComponent,
     }
    ]
  },
]

@NgModule({
  declarations: [
    EmployerInterviewComponent,
    AddInterviewTemplatesComponent,
    InterviewTemplateStepComponent,
    CreateNewTemplateDialogComponent,
    InviteContactComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class EmployerInterviewModule { }
