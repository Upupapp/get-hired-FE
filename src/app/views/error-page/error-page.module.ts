import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ErrorPageRoutes } from './error-page.routing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ErrorNotFoundComponent } from './error-not-found/error-not-found.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(ErrorPageRoutes)
  ],
  declarations: [
    // BRAND fix: this component was imported but never actually declared,
    // so the module would have failed to render it even once routed to.
    ErrorNotFoundComponent
  ]
})
export class ErrorPageModule{ }
