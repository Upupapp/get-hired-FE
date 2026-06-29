import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-subscription-status-banner',
  template: `
    <div class="sub-banner" *ngIf="visible" [ngClass]="bannerClass" role="alert" aria-live="polite">
      <div class="sub-banner__content">
        <svg class="sub-banner__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <path d="M12 8v5M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <div class="sub-banner__text">
          <strong class="sub-banner__title">{{ title }}</strong>
          <span class="sub-banner__body">{{ body }}</span>
        </div>
      </div>
      <button *ngIf="ctaLabel && ctaRoute" class="sub-banner__cta" type="button" (click)="handleCta()">
        {{ ctaLabel }}
      </button>
    </div>
  `,
  styleUrls: ['./subscription-status-banner.component.scss']
})
export class SubscriptionStatusBannerComponent {
  @Input() planStatus: string = '';
  @Input() trialEndsAt: string | null = null;

  constructor(private router: Router) {}

  get visible(): boolean {
    return ['trial_ending', 'trial_expired', 'subscription_expired', 'subscription_pending_payment'].indexOf(this.planStatus) !== -1;
  }

  get bannerClass(): string {
    if (this.planStatus === 'trial_ending') return 'sub-banner--warn';
    if (this.planStatus === 'trial_expired' || this.planStatus === 'subscription_expired') return 'sub-banner--danger';
    if (this.planStatus === 'subscription_pending_payment') return 'sub-banner--payment';
    return '';
  }

  get title(): string {
    if (this.planStatus === 'trial_ending') return 'Your free trial is ending soon';
    if (this.planStatus === 'trial_expired') return 'Your free trial has ended';
    if (this.planStatus === 'subscription_expired') return 'Your plan has expired';
    if (this.planStatus === 'subscription_pending_payment') return 'Payment required';
    return '';
  }

  get body(): string {
    if (this.planStatus === 'trial_ending') return 'Upgrade now to keep your job posts active and hiring without interruption.';
    if (this.planStatus === 'trial_expired') return 'Your active job posts are paused. Choose a plan to resume hiring.';
    if (this.planStatus === 'subscription_expired') return 'Your plan has expired. Renew to restore full access.';
    if (this.planStatus === 'subscription_pending_payment') return 'Your payment is pending. Update your payment details to continue.';
    return '';
  }

  get ctaLabel(): string {
    if (this.planStatus === 'trial_ending' || this.planStatus === 'trial_expired') return 'Upgrade now';
    if (this.planStatus === 'subscription_expired') return 'Renew plan';
    if (this.planStatus === 'subscription_pending_payment') return 'Fix payment';
    return '';
  }

  get ctaRoute(): string {
    return '/recruiter/subscription';
  }

  handleCta(): void {
    this.router.navigate([this.ctaRoute]);
  }
}
