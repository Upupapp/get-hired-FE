import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ErrorPageRoutes } from './error-page.routing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ErrorNotFoundComponent } from './error-not-found/error-not-found.component';
import { CoreModule } from '@app-core/core.module';
import { SharedModule } from '@app-shared/shared.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(ErrorPageRoutes),
    // Brings in app-header (CoreModule) and app-footer (SharedModule) so
    // this standalone wildcard-route page can render the real site
    // header/footer, matching every other public page (see BUGFIX
    // comment in error-not-found.component.html).
    CoreModule,
    SharedModule,
  ],
  declarations: [
    // BRAND fix: this component was imported but never actually declared,
    // so the module would have failed to render it even once routed to.
    ErrorNotFoundComponent
  ]
})
export class ErrorPageModule{ }
