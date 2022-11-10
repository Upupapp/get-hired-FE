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
import { MatDialogModule } from '@angular/material/dialog';
import { CompanyDetailsComponent } from './company-details/company-details.component';
import { BannerDetailsComponent } from './company-details/components/banner-details/banner-details.component';

const exportedComponents = [
  CompanyComponent,
  CompanyDetailsFormComponent,
  CompanyUsersComponent,
  CompanyNotSetupComponent,
  CompanyDetailsComponent,
  BannerDetailsComponent
];

@NgModule({
  declarations: [
    ...exportedComponents,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    MatDialogModule,
    StoreModule.forFeature('company', companyReducer),
    EffectsModule.forFeature([CompanyEffects])
  ],
  exports: [...exportedComponents],
  providers: [CompanyFacade]
})
export class CompanyModule { }
