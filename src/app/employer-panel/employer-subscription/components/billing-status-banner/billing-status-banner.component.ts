import {
  Component, Input, OnChanges, SimpleChanges, ChangeDetectionStrategy,
} from '@angular/core';
import { Router } from '@angular/router';
import { LifecycleStatus } from '../../services/subscription-lifecycle.service';

@Component({
  selector: 'app-billing-status-banner',
  template: `
    <div *ngIf="visible" class="billing-banner billing-banner--{{ bannerClass }}" role="status" aria-label="Billing status">
      <div class="billing-banner__content">
        <div class="billing-banner__left">
          <span class="billing-banner__label">{{ label }}</span>
          <span class="billing-banner__meta" *ngIf="meta">{{ meta }}</span>
        </div>
        <div class="billing-banner__right" *ngIf="showAmount">
          <span class="billing-banner__cycle-badge" [class.billing-banner__cycle-badge--annual]="isAnnual">
            {{ isAnnual ? 'Annual' : 'Monthly' }}
          </span>
          <span class="billing-banner__amount" *ngIf="amountLabel">{{ amountLabel }}</span>
        </div>
      </div>
      <button *ngIf="ctaLabel" class="billing-banner__cta" type="button" (click)="handleCta()">
        {{ ctaLabel }}
      </button>
    </div>
  `,
  styleUrls: ['./billing-status-banner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BillingStatusBannerComponent implements OnChanges {
  @Input() lifecycle: LifecycleStatus | null = null;

  visible = false;
  bannerClass = 'neutral';
  label = '';
  meta: string | null = null;
  ctaLabel: string | null = null;
  ctaRoute: string | null = null;
  showAmount = false;
  amountLabel: string | null = null;

  constructor(private router: Router) {}

  get isAnnual(): boolean { return (this.lifecycle && this.lifecycle.billingCycle === 'annual') || false; }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['lifecycle']) { this.derive(); }
  }

  private derive(): void {
    if (!this.lifecycle) { this.visible = false; return; }
    const s = this.lifecycle.status;
    const cycle = this.lifecycle.billingCycle || 'monthly';
    const annual = cycle === 'annual';
    const periodEnd = this.lifecycle.periodEnd ? this.formatDate(this.lifecycle.periodEnd) : null;
    const planName = this.lifecycle.subscriptionName || 'GetHired';
    const amt = this.lifecycle.amountPaid;
    const amtLabel = amt ? '₱' + amt.toLocaleString('en-PH', { minimumFractionDigits: 0 }) : null;

    this.showAmount = false;
    this.meta = null;
    this.ctaLabel = null;
    this.ctaRoute = null;
    this.visible = true;

    if (s === 'active') {
      this.bannerClass = 'active';
      this.label = planName + ' plan active';
      this.meta = periodEnd ? 'Renews ' + (annual ? 'annually' : 'monthly') + ' · next billing ' + periodEnd : null;
      this.showAmount = !!amtLabel;
      this.amountLabel = amtLabel;
      this.visible = false; // Don't show banner for clean active state — no news is good news

    } else if (s === 'renewal_due_soon') {
      this.bannerClass = 'warn';
      this.label = 'Renewal coming up';
      this.meta = annual
        ? 'Your annual subscription renews on ' + periodEnd + '. Full amount will be charged.'
        : 'Your subscription renews on ' + periodEnd + '.';

    } else if (s === 'pending_payment') {
      this.bannerClass = 'pending';
      this.label = annual ? 'Annual payment pending' : 'Monthly payment pending';
      this.meta = annual
        ? 'Your 12-month access will activate once payment is confirmed.'
        : 'Your subscription will update once payment is confirmed.';
      this.ctaLabel = 'Check payment status';
      this.ctaRoute = '/recruiter/subscription';

    } else if (s === 'payment_failed') {
      this.bannerClass = 'error';
      this.label = 'Payment failed';
      this.meta = 'Your payment did not go through. Your existing jobs, applicants, messages, and company page are still available.';
      this.ctaLabel = 'Retry payment';
      this.ctaRoute = '/recruiter/subscription';

    } else if (s === 'past_due') {
      this.bannerClass = 'error';
      this.label = 'Payment overdue';
      this.meta = 'Settle your payment to avoid limits on new hiring activity.';
      this.ctaLabel = 'Update payment';
      this.ctaRoute = '/recruiter/subscription';

    } else if (s === 'grace_period') {
      this.bannerClass = 'error';
      this.label = 'Grace period — payment needed';
      this.meta = 'Your subscription has lapsed. Settle payment by ' + (periodEnd || 'soon') + ' to keep all features.';
      this.ctaLabel = 'Settle payment';
      this.ctaRoute = '/recruiter/subscription';

    } else if (s === 'expired') {
      this.bannerClass = 'expired';
      this.label = 'Subscription expired';
      this.meta = 'Renew or choose a plan to continue publishing jobs. Your existing data is safe.';
      this.ctaLabel = 'Renew subscription';
      this.ctaRoute = '/recruiter/subscription';

    } else if (s === 'trialing') {
      this.bannerClass = 'trial';
      this.label = 'Free trial active';
      this.meta = periodEnd ? 'Trial ends ' + periodEnd + '.' : null;
      this.ctaLabel = 'Upgrade now';
      this.ctaRoute = '/recruiter/subscription';

    } else if (s === 'trial_ending') {
      this.bannerClass = 'trial-end';
      this.label = 'Trial ending soon';
      this.meta = 'Your free trial ends ' + (periodEnd || 'soon') + '. Upgrade to keep all features.';
      this.ctaLabel = 'Choose a plan';
      this.ctaRoute = '/recruiter/subscription';

    } else if (s === 'trial_expired') {
      this.bannerClass = 'expired';
      this.label = 'Free trial ended';
      this.meta = 'Choose a plan to continue publishing jobs.';
      this.ctaLabel = 'Choose a plan';
      this.ctaRoute = '/recruiter/subscription';

    } else {
      this.visible = false;
    }
  }

  handleCta(): void {
    if (this.ctaRoute) { this.router.navigate([this.ctaRoute]); }
  }

  private formatDate(iso: string): string {
    try {
      return new Date(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) { return iso; }
  }
}
