import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubscriptionsListComponent } from './subscriptions-list/subscriptions-list.component';
import { SubscriptionsFacade } from './state/subscriptions.facade';
import { subscriptionsReducer } from './state/subscriptions.reducer';
import { SubscriptionsEffects } from './state/subscriptions.effects';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';



@NgModule({
  declarations: [
    SubscriptionsListComponent
  ],
  imports: [
    CommonModule,
    StoreModule.forFeature('subscriptions', subscriptionsReducer),
    EffectsModule.forFeature([SubscriptionsEffects])
  ],
  exports: [
    SubscriptionsListComponent,
  ],
  providers: [SubscriptionsFacade]
})
export class SubscriptionsModule { }
