import { NgModule, ModuleWithProviders } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { ContactEffect } from './effects/contact.effect';

import { ContactReducer } from './reducers/contact.reducer';

@NgModule({
    imports: [
      StoreModule.forFeature('contact', ContactReducer),
      EffectsModule.forFeature([
        ContactEffect
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
  