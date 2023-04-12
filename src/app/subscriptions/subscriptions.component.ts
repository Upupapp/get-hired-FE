import { Component, Input, OnInit } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { SubscriptionsFacade } from './state/subscriptions.facade';
import { of, tap } from 'rxjs';

@Component({
  selector: 'app-subscriptions',
  templateUrl: './subscriptions.component.html',
  styleUrls: ['./subscriptions.component.scss'],
  animations: [mainAnimations]
})
export class SubscriptionsComponent implements OnInit {
  companySubsEndDate: any;
  pageTitle = "GetHired Premium Pricing";

  details$ = this.subscriptionFacade.companySubs$
    .pipe(
      tap(subs => {
        if (subs) {
          if (subs.length > 1) {
            this.companySubsEndDate = subs[0].endAt;
            this.pageTitle = "Your Company's Subscription";
          } else if (subs.length == 1) {
            this.companySubsEndDate = subs[0].endAt;
          }
        }
      })
    );
  loading$ = this.subscriptionFacade.loading$;

  constructor(
    private subscriptionFacade: SubscriptionsFacade,
  ) { }

  ngOnInit(): void {
    const user = localStorage.getItem('user');

    if (user) {
      this.subscriptionFacade.getCompanySubs(JSON.parse(user).companyId);
      this.subscriptionFacade.getAllSubscriptions();

    }

  }

  payNow(companyId) {

  }

  upgrade(companyId) {

  }

}
