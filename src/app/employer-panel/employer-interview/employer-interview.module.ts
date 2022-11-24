import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployerInterviewComponent } from './employer-interview.component';
import { SharedModule } from '@app-shared/shared.module';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', component: EmployerInterviewComponent }
]

@NgModule({
  declarations: [
    EmployerInterviewComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class EmployerInterviewModule { }
