import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Nudge } from './engagement-contract.models';
import { majorSurfaces } from './engagement-message.presentation';
import { SubscriptionEngagementService } from './subscription-engagement.service';

/**
 * The employer shell's banner slot (F2): `context.banner`, above every employer page. Outside the
 * employer shell, and on the server, the context is null, so nothing is read and nothing renders.
 */
@Component({
  selector: 'app-engagement-shell-banner',
  template: `
    <div class="gh-engagement-shell-banner" *ngIf="banner$ | async as banner">
      <app-subscription-status-banner [message]="banner"></app-subscription-status-banner>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .gh-engagement-shell-banner { padding: 16px 24px 0; }
    @media (max-width: 767.98px) { .gh-engagement-shell-banner { padding: 12px 12px 0; } }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EngagementShellBannerComponent {
  readonly banner$: Observable<Nudge | null>;

  constructor(engagement: SubscriptionEngagementService) {
    this.banner$ = engagement.context$.pipe(map(context => majorSurfaces(context).banner));
  }
}
