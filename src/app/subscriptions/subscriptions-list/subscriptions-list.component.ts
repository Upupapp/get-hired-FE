import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { Subscription, of, tap } from 'rxjs';
import { SubscriptionsFacade } from '../state/subscriptions.facade';
import { SubscriptionSummaryComponent } from '../subscription-summary/subscription-summary.component';

@Component({
  selector: 'app-subscriptions-list',
  templateUrl: './subscriptions-list.component.html',
  styleUrls: ['./subscriptions-list.component.scss'],
  animations: [mainAnimations]
})
export class SubscriptionsListComponent implements OnInit {
  @Input() endDate: Date = null;
  confirmation$: Subscription;
  list$ = this.subscriptionFacade.subscriptionsList$;
  computedDays = 0;

  constructor(
    private subscriptionFacade: SubscriptionsFacade,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void { }

  upgrade(chosenSub) {
    // TODO add to cart
    const ref = this.dialog.open(SubscriptionSummaryComponent, {
      disableClose: true,
      width: '50vw',
      data: {
        ...chosenSub
      },
    });

    this.confirmation$ = ref
      .afterClosed()
      .pipe()
      .subscribe((result) => {
        if (result == 1) {

        }
      });
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if(this.confirmation$) this.confirmation$.unsubscribe();
  }

}
