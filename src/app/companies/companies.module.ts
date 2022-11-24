import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompaniesComponent } from './companies.component';
import { RouterModule, Routes } from '@angular/router';
import { CompanyCardComponent } from './company-card/company-card.component';
import { PublicCompanyDetailsComponent } from './public-company-details/public-company-details.component';
import { PublicCompaniesRecommendedComponent } from './public-companies-recommended/public-companies-recommended.component';
import { CompanyModule } from '@main/company/company.module';
import { CompaniesFacade } from './state/companies.facade';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { companiesReducer } from './state/companies.reducer';
import { CompaniesEffects } from './state/companies.effects';
import { JobsModule } from '@main/jobs/jobs.module';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: 'details', component: PublicCompanyDetailsComponent }
    ]
  }
];

const exportedComponents = [
  PublicCompanyDetailsComponent,
  PublicCompaniesRecommendedComponent
];

@NgModule({
  declarations: [
    CompaniesComponent,
    CompanyCardComponent,
    ...exportedComponents,
  ],
  imports: [
    CommonModule,
    JobsModule,
    StoreModule.forFeature('companies', companiesReducer),
    EffectsModule.forFeature([CompaniesEffects]),
    RouterModule.forChild(routes)
  ],
  exports: [
    ...exportedComponents
  ],
  providers: [CompaniesFacade]
})
export class CompaniesModule { }
