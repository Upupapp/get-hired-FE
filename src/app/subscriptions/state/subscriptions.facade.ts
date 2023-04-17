import { Injectable } from "@angular/core";
import * as Model from '../subscriptions.model';
import { State } from './subscriptions.reducer';
import { select, Store } from "@ngrx/store";
import * as SubscriptionsAction from './subscriptions.actions';
import * as fromfeature from './subscriptions.selector';

@Injectable()
export class SubscriptionsFacade {
    loading$ = this.store.pipe(select(fromfeature.loading));
    subscriptionsDetails$ = this.store.pipe(select(fromfeature.getSubscriptionsDetails));
    subscriptionsList$ = this.store.pipe(select(fromfeature.getSubscriptionsList));
    success$ = this.store.pipe(select(fromfeature.getSuccessMsg));
    companySubs$ = this.store.pipe(select(fromfeature.getCompanySubs));

    constructor(
      private store: Store<State>,
      ) { }

    getAllSubscriptions() {
      console.log('ilang tawag ba?')
      this.store.dispatch(SubscriptionsAction.getAllsubscriptions());
    }

    getSubscriptions(subscriptionsId?: string) {
      this.store.dispatch(SubscriptionsAction.getSubscriptions({ subscriptionsId }));
    }

    getCompanySubs(companyId: string) {
      this.store.dispatch(SubscriptionsAction.getCompanysubscriptions({ companyId }));
    }

}
