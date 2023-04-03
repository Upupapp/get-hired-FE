import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SiteDownComponent } from './site-down.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', component: SiteDownComponent }
]


@NgModule({
  declarations: [
    SiteDownComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class SiteDownModule { }
