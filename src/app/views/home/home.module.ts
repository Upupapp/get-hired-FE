import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HomeRoutes } from './home.routing';
import { HomeComponent } from './home.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialComponentsModule } from '../../shared/components/material-components/material-components.module';
import { BannerComponent } from './banner/banner.component';
import { JobCardComponent } from './components/job-card/job-card.component';
import { CompaniesComponent } from './companies/companies.component';
import { JobCardListViewComponent } from './components/job-card-list-view/job-card-list-view.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialComponentsModule,
    RouterModule.forChild(HomeRoutes)
  ],
  declarations: [
    BannerComponent,
  	HomeComponent,
    JobCardComponent,
    CompaniesComponent,
    JobCardListViewComponent,
  ]
})
export class HomeModule{ }
