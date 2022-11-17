import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployerContactsComponent } from './employer-contacts.component';
import { SharedModule } from '@app-shared/shared.module';



@NgModule({
  declarations: [
    EmployerContactsComponent
  ],
  imports: [
    CommonModule,
    SharedModule
  ]
})
export class EmployerContactsModule { }
