import { Component, Input } from '@angular/core';

export type TrialBadgeStatus = 'trialing' | 'trial_ending' | 'trial_expired';

/**
 * What the trial badge says (F4). The number is the backend's `context.subscription.trial.daysRemaining`,
 * never computed here, and the badge says nothing about what the end of a trial changes: it only tells time.
 * A missing or impossible figure shows nothing rather than a guess.
 */
export function trialBadgeText(status: TrialBadgeStatus | null, daysRemaining: number | null): string | null {
  if (status === 'trial_expired') { return 'Your free trial has ended'; }
  if (!status || typeof daysRemaining !== 'number' || !isFinite(daysRemaining) || daysRemaining < 0) { return null; }
  if (daysRemaining === 0) { return 'Your free trial ends today'; }
  return daysRemaining === 1 ? '1 day left in your free trial' : `${daysRemaining} days left in your free trial`;
}

@Component({
  selector: 'app-trial-days-remaining-badge',
  template: `
    <div class="trial-badge" *ngIf="text as badgeText" role="status" [ngClass]="{'trial-badge--urgent': urgent}">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
        <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <span>{{ badgeText }}</span>
    </div>
  `,
  styleUrls: ['./trial-days-remaining-badge.component.scss']
})
export class TrialDaysRemainingBadgeComponent {
  @Input() status: TrialBadgeStatus | null = null;
  /** Whole days left, rounded up, never below 0, as the backend sends it (contract §4.1). */
  @Input() daysRemaining: number | null = null;

  get text(): string | null {
    return trialBadgeText(this.status, this.daysRemaining);
  }

  get urgent(): boolean {
    return this.status === 'trial_expired' || (typeof this.daysRemaining === 'number' && this.daysRemaining <= 2);
  }
}
