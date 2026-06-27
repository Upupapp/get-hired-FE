import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompaniesComponent } from './companies.component';
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
import { SharedModule } from '@app-shared/shared.module';

// NOTE: RouterModule.forChild() deliberately NOT included here.
// CompaniesModule is eagerly imported by PublicModule (for its exported
// components). If RouterModule.forChild() were present, Angular would
// merge company routes ({path:':slug'}) at the PublicModule scope,
// which causes ':slug' to match '/home', '/jobs', etc before the correct
// named routes. Company routing is defined inline in public.module.ts.

const exportedComponents = [
  CompaniesComponent,
  PublicCompanyDetailsComponent,
  PublicCompaniesRecommendedComponent
];

@NgModule({
  declarations: [
    CompanyCardComponent,
    ...exportedComponents,
  ],
  imports: [
    CommonModule,
    JobsModule,
    SharedModule,
    StoreModule.forFeature('companies', companiesReducer),
    EffectsModule.forFeature([CompaniesEffects]),
  ],
  exports: [
    ...exportedComponents
  ],
  providers: [CompaniesFacade]
})
export class CompaniesModule { }
