import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployerInterviewComponent } from './employer-interview.component';
import { SharedModule } from '@app-shared/shared.module';



@NgModule({
  declarations: [
    EmployerInterviewComponent
  ],
  imports: [
    CommonModule,
    SharedModule
  ]
})
export class EmployerInterviewModule { }
