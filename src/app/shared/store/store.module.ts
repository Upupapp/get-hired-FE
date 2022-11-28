import { NgModule, ModuleWithProviders } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { ContactEffect } from './effects/contact.effect';
import { GroupEffect } from './effects/group.effect';

import { ContactReducer } from './reducers/contact.reducer';
import { GroupReducer } from './reducers/group.reducer';

@NgModule({
    imports: [
      StoreModule.forFeature('contact', ContactReducer),
      StoreModule.forFeature('group', GroupReducer),
      EffectsModule.forFeature([
        ContactEffect,
        GroupEffect
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
  