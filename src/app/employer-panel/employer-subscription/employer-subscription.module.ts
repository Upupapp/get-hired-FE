import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployerSubscriptionComponent } from './employer-subscription.component';
import { SharedModule } from '@app-shared/shared.module';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', component: EmployerSubscriptionComponent }
]

@NgModule({
  declarations: [
    EmployerSubscriptionComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class EmployerSubscriptionModule { }
