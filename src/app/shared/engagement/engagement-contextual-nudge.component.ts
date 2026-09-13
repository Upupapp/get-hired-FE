import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { EngagementContext, Nudge, NudgeMeter } from './engagement-contract.models';
import { contextualNudges } from './engagement-message.presentation';
import { SubscriptionEngagementService } from './subscription-engagement.service';

/**
 * CONTEXTUAL_NUDGE (F5): the backend's messages for one meter, as a compact card beside the action they concern:
 * `jobs` beside Post a job and Publish, `seats` beside adding a team member. It reads the shared context itself, so
 * the screen hosting it changes by one template line. Outside the employer shell, and on the server, it shows nothing.
 */
@Component({
  selector: 'app-engagement-contextual-nudge',
  template: `
    <ng-container *ngIf="context$ | async as context">
      <div class="gh-contextual-nudge" *ngFor="let message of nudgesFor(context); trackBy: trackById">
        <app-upgrade-prompt-card [message]="message" [compact]="true"></app-upgrade-prompt-card>
      </div>
    </ng-container>
  `,
  styles: [`
    :host { display: block; }
    .gh-contextual-nudge { margin: 12px 0; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EngagementContextualNudgeComponent {
  /** Which meter's messages belong beside this action. */
  @Input() meter: NudgeMeter | null = null;

  readonly context$: Observable<EngagementContext | null>;

  constructor(engagement: SubscriptionEngagementService) {
    this.context$ = engagement.context$;
  }

  nudgesFor(context: EngagementContext): Nudge[] {
    return this.meter ? contextualNudges(context, this.meter) : [];
  }

  trackById(_index: number, message: Nudge): string {
    return message.id;
  }
}
