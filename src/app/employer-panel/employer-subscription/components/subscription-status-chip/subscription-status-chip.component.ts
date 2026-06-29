import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-subscription-status-chip',
  template: `
    <span class="sub-status-chip" [ngClass]="chipClass" role="status" [attr.aria-label]="'Plan status: ' + label">
      <span class="sub-status-chip__dot" aria-hidden="true"></span>
      {{ label }}
    </span>
  `,
  styleUrls: ['./subscription-status-chip.component.scss']
})
export class SubscriptionStatusChipComponent {
  @Input() status: string = '';

  get label(): string {
    const map: Record<string, string> = {
      trial_active: 'Free Trial',
      trial_ending: 'Trial Ending',
      trial_expired: 'Trial Expired',
      subscription_active: 'Active',
      subscription_pending_payment: 'Payment Pending',
      subscription_expired: 'Expired',
      none: 'No Plan',
    };
    return map[this.status] || this.status;
  }

  get chipClass(): string {
    if (this.status === 'subscription_active') return 'sub-status-chip--active';
    if (this.status === 'trial_active') return 'sub-status-chip--trial';
    if (this.status === 'trial_ending' || this.status === 'subscription_pending_payment') return 'sub-status-chip--warn';
    if (this.status === 'trial_expired' || this.status === 'subscription_expired') return 'sub-status-chip--expired';
    return 'sub-status-chip--neutral';
  }
}
