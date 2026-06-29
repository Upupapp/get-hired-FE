import { Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-trial-days-remaining-badge',
  template: `
    <div class="trial-badge" *ngIf="daysRemaining !== null" role="status"
      [ngClass]="{'trial-badge--urgent': daysRemaining !== null && daysRemaining <= 2}"
      [attr.aria-label]="'Free trial: ' + daysRemaining + ' day' + (daysRemaining !== 1 ? 's' : '') + ' remaining'">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
        <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <span>
        <strong>{{ daysRemaining }}</strong>
        {{ daysRemaining === 1 ? 'day' : 'days' }} left in free trial
      </span>
    </div>
  `,
  styleUrls: ['./trial-days-remaining-badge.component.scss']
})
export class TrialDaysRemainingBadgeComponent implements OnChanges {
  @Input() trialEndsAt: string | null = null;

  daysRemaining: number | null = null;

  ngOnChanges(): void {
    if (!this.trialEndsAt) { this.daysRemaining = null; return; }
    const end = new Date(this.trialEndsAt);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    this.daysRemaining = diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0;
  }
}
