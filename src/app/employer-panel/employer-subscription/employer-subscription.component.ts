import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { CartListComponent } from '@main/cart/cart-list/cart-list.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-employer-subscription',
  templateUrl: './employer-subscription.component.html',
  styleUrls: ['./employer-subscription.component.scss'],
  animations: [mainAnimations],
})
export class EmployerSubscriptionComponent implements OnInit {

  cartConfirm$: Subscription;

  constructor(
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
  }


  upgradeSubscription(subscription) {
    const ref = this.dialog.open(CartListComponent, {
      disableClose: true,
      data: {
        subscriptionDetails: subscription
      }
    });

    this.cartConfirm$ = ref
      .afterClosed()
      .pipe()
      .subscribe((result) => {

      });
  }
}
