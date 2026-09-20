import { ChangeDetectionStrategy, Component } from '@angular/core';
import { map } from 'rxjs/operators';
import { majorSurfaces } from './engagement-message.presentation';
import { SubscriptionEngagementService } from './subscription-engagement.service';

@Component({
  selector: 'app-engagement-dashboard-card',
  template: `<div class="gh-engagement-card" *ngIf="card$ | async as message">
    <app-upgrade-prompt-card [message]="message"></app-upgrade-prompt-card>
  </div>`,
  styles: [`.gh-engagement-card { margin: 16px 0; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EngagementDashboardCardComponent {
  readonly card$ = this.engagement.context$.pipe(map(context => majorSurfaces(context).card));
  constructor(private engagement: SubscriptionEngagementService) {}
}
