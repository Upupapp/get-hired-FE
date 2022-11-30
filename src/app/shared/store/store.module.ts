import { NgModule, ModuleWithProviders } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { ContactEffect } from './effects/contact.effect';
import { GroupEffect } from './effects/group.effect';
import { CandidateEffect } from './effects/candidate.effect';
import { CompanyEffect } from './effects/company.effect';

import { ContactReducer } from './reducers/contact.reducer';
import { GroupReducer } from './reducers/group.reducer';
import { CandidateReducer } from './reducers/candidate.reducer';
import { CompanyReducer } from './reducers/company.reducer';

@NgModule({
    imports: [
      StoreModule.forFeature('contact', ContactReducer),
      StoreModule.forFeature('group', GroupReducer),
      StoreModule.forFeature('candidate', CandidateReducer),
      StoreModule.forFeature('company', CompanyReducer),
      EffectsModule.forFeature([
        ContactEffect,
        GroupEffect,
        CandidateEffect,
        CompanyEffect
      ]),
    ],
    providers: [
      // services/injectables
    ],
  })
  export class StorePublicModule {
    public static forRoot(): ModuleWithProviders<StorePublicModule> {
      return {
        ngModule: StorePublicModule,
        providers: [
          //services/injectables
        ],
      };
    }
  }
  