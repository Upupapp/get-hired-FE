import { Component, OnInit } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { tap } from 'rxjs';
import { SubscriptionsFacade } from '../state/subscriptions.facade';

@Component({
  selector: 'app-subscriptions-list',
  templateUrl: './subscriptions-list.component.html',
  styleUrls: ['./subscriptions-list.component.scss'],
  animations: [mainAnimations]
})
export class SubscriptionsListComponent implements OnInit {

  list$ = this.subscriptionFacade.subscriptionsList$;
  computedDays = 0;

  constructor(
    private subscriptionFacade: SubscriptionsFacade
  ) { }

  ngOnInit(): void {
    this.subscriptionFacade.getAllSubscriptions();

    this.computedDays = this.countDown();
  }

  upgrade(){

  }

  countDown() {
    const today = new Date();

    const targetDate = new Date('04/07/2023 23:59');
    console.log(targetDate);
    const monthDiff = targetDate.getMonth() - today.getMonth();

    return (targetDate.getDate() + (monthDiff * 30)) - today.getDate();


  }

}
