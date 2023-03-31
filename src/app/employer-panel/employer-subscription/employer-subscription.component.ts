import { Component, OnInit } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';

@Component({
  selector: 'app-employer-subscription',
  templateUrl: './employer-subscription.component.html',
  styleUrls: ['./employer-subscription.component.scss'],
  animations: [mainAnimations],
})
export class EmployerSubscriptionComponent implements OnInit {

  withActiveSubscription = localStorage.getItem('withActiveSubscription');

  constructor() { }

  ngOnInit(): void {
  }

}
