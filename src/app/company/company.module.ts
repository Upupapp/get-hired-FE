import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyComponent } from './company.component';
import { CompanyFacade } from './state/company.facade';
import { CompanyEffects } from './state/company.effects';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { companyReducer } from './state/company.reducer';
import { CompanyDetailsFormComponent } from './company-details-form/company-details-form.component';
import { SharedModule } from '@app-shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { CompanyUsersComponent } from './company-users/company-users.component';
import { CompanyNotSetupComponent } from './company-not-setup/company-not-setup.component';

const exportedComponents = [
  CompanyComponent,
  CompanyDetailsFormComponent,
  CompanyUsersComponent,
  CompanyNotSetupComponent
];

@NgModule({
  declarations: [
    ...exportedComponents
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    StoreModule.forFeature('company', companyReducer),
    EffectsModule.forFeature([CompanyEffects])
  ],
  exports: [...exportedComponents],
  providers: [CompanyFacade]
})
export class CompanyModule { }
