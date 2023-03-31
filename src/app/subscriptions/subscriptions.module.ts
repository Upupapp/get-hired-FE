import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubscriptionsListComponent } from './subscriptions-list/subscriptions-list.component';
import { SubscriptionsFacade } from './state/subscriptions.facade';
import { subscriptionsReducer } from './state/subscriptions.reducer';
import { SubscriptionsEffects } from './state/subscriptions.effects';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { SubscriptionSummaryComponent } from './subscription-summary/subscription-summary.component';
import { SharedModule } from '@app-shared/shared.module';
import { SubscriptionsComponent } from './subscriptions.component';



@NgModule({
  declarations: [
    SubscriptionsListComponent,
    SubscriptionSummaryComponent,
    SubscriptionsComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    StoreModule.forFeature('subscriptions', subscriptionsReducer),
    EffectsModule.forFeature([SubscriptionsEffects])
  ],
  exports: [
    SubscriptionsComponent
  ],
  providers: [SubscriptionsFacade]
})
export class SubscriptionsModule { }
