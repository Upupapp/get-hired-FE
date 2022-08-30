import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CompanyPanelRoutes } from './company-panel.routing';
import { CompanyPanelComponent } from './company-panel.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialComponentsModule } from '../../shared/components/material-components/material-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialComponentsModule,
    RouterModule.forChild(CompanyPanelRoutes)
  ],
  declarations: [
  	CompanyPanelComponent,
  ]
})
export class CompanyPanelModule{ }
