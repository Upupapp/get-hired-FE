import { Component, Input, OnInit } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { SubscriptionsFacade } from './state/subscriptions.facade';

@Component({
  selector: 'app-subscriptions',
  templateUrl: './subscriptions.component.html',
  styleUrls: ['./subscriptions.component.scss'],
  animations: [mainAnimations]
})
export class SubscriptionsComponent implements OnInit {
  @Input() isActiveSubs: boolean;

  details$ = this.subscriptionFacade.companySubs$;
  loading$ = this.subscriptionFacade.loading$;

  constructor(
    private subscriptionFacade: SubscriptionsFacade,
  ) { }

  ngOnInit(): void {
    const user = localStorage.getItem('user');

    if(this.isActiveSubs && user) {
      this.subscriptionFacade.getCompanySubs(JSON.parse(user).companyId);
    }

  }

  payNow(companyId) {

  }

  upgrade(companyId) {

  }

}
