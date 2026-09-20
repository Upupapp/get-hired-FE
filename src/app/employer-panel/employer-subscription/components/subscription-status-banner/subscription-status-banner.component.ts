import { EngagementTelemetryService } from '@main/shared/engagement/engagement-telemetry.service';
import { ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { CtaAction, Nudge } from '@main/shared/engagement/engagement-contract.models';
import {
  PriorityPresentation, hidesAfterDismiss, navigatesAfterClick, priorityPresentation,
} from '@main/shared/engagement/engagement-message.presentation';
import { SubscriptionEngagementService } from '@main/shared/engagement/subscription-engagement.service';

@Component({
  selector: 'app-subscription-status-banner',
  template: `
    <!-- F2: a backend message (contract Nudge), fed from context.banner by the employer shell. -->
    <ng-container *ngIf="message as msg; else legacyBanner">
      <div class="sub-banner sub-banner--message" *ngIf="!messageHidden" [ngClass]="'sub-banner--' + presentationOf(msg).tone"
        [attr.role]="presentationOf(msg).urgent ? 'alert' : 'status'" [attr.data-priority]="msg.priority">
        <div class="sub-banner__content">
          <span class="sub-banner__icon" aria-hidden="true" [ngSwitch]="presentationOf(msg).tone">
            <svg *ngSwitchCase="'warning'" width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 3.5l9 16H3l9-16z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
              <path d="M12 10v4M12 17h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <svg *ngSwitchCase="'notice'" width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M12 11v6M12 7.5h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <svg *ngSwitchCase="'info'" width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M12 11v6M12 7.5h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <svg *ngSwitchDefault width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M12 8v5M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </span>
          <div class="sub-banner__text">
            <span class="sub-banner__meta">
              <span class="sub-banner__priority">{{ presentationOf(msg).label }}</span>
              <span class="sub-banner__eyebrow" *ngIf="msg.copy.eyebrow">{{ msg.copy.eyebrow }}</span>
            </span>
            <strong class="sub-banner__title">{{ msg.copy.title }}</strong>
            <span class="sub-banner__body" *ngIf="msg.copy.body">{{ msg.copy.body }}</span>
          </div>
        </div>
        <div class="sub-banner__actions" *ngIf="msg.actions.length || msg.presentation.dismissible">
          <button *ngFor="let action of msg.actions" type="button" class="sub-banner__cta sub-banner__action"
            [class.sub-banner__cta--secondary]="action.type !== 'PRIMARY'" [disabled]="busy"
            (click)="followAction(msg, action)">{{ action.label }}</button>
          <button *ngIf="msg.presentation.dismissible" type="button" class="sub-banner__dismiss" [disabled]="busy"
            [attr.aria-label]="'Dismiss: ' + msg.copy.title" (click)="dismissMessage(msg)">Dismiss</button>
        </div>
      </div>
    </ng-container>
    <ng-template #legacyBanner>
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
    </ng-template>
  `,
  styleUrls: ['./subscription-status-banner.component.scss']
})
export class SubscriptionStatusBannerComponent implements OnChanges {
  @Input() planStatus: string = '';
  @Input() trialEndsAt: string | null = null;
  /** F2: a backend message. When set, it is rendered as given and planStatus is not used. */
  @Input() message: Nudge | null = null;

  messageHidden = false;
  busy = false;

  constructor(
    private router: Router,
    private engagement: SubscriptionEngagementService,
    private cdr: ChangeDetectorRef,
    private telemetry: EngagementTelemetryService,
  ) {}

  private impressionId: string | null = null;
  ngOnInit(): void { this.recordImpression(); }
  private recordImpression(): void {
    if (!this.message || this.impressionId === (this.message.id || this.message.ruleKey)) { return; }
    this.impressionId = this.message.id || this.message.ruleKey;
    if (this.message.id && typeof (this.engagement as any).seen === 'function') { (this.engagement as any).seen(this.message.id); }
    this.telemetry.record('subscription_nudge_impression', this.message, 'employer_shell');
    if (this.message.meter === 'storage') { this.telemetry.record('storage_warning_impression', this.message, 'employer_shell'); }
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.recordImpression();
    const change = changes['message'];
    if (change && !change.firstChange) {
      const before = change.previousValue as Nudge | null;
      const after = change.currentValue as Nudge | null;
      if (!before || !after || before.id !== after.id) { this.messageHidden = false; }
    }
  }

  presentationOf(message: Nudge): PriorityPresentation {
    return priorityPresentation(message.priority);
  }

  /** Post the click, then go to the action's own url (contract §3.5). */
  followAction(message: Nudge, action: CtaAction): void {
    if (this.busy) { return; }
    this.telemetry.record('subscription_nudge_clicked', message, 'employer_shell');
    if (message.meter === 'storage' && (action.intent === 'VIEW_PLAN' || action.intent === 'COMPARE_PLANS')) { this.telemetry.record('storage_upgrade_clicked', message, 'employer_shell'); }
    if (!message.id) { this.router.navigateByUrl(action.url); return; }
    this.busy = true;
    this.engagement.click(message.id, action.intent).subscribe(outcome => {
      this.busy = false;
      this.cdr.markForCheck();
      if (navigatesAfterClick(outcome)) { this.router.navigateByUrl(action.url); }
    });
  }

  /** Offered only when the message is dismissible; a refusal leaves it in place (contract §3.4, §7.3). */
  dismissMessage(message: Nudge): void {
    if (this.busy || !message.presentation.dismissible) { return; }
    this.busy = true;
    this.engagement.dismiss(message.id).subscribe(outcome => {
      this.busy = false;
      if (hidesAfterDismiss(outcome)) {
        this.telemetry.record('subscription_nudge_dismissed', message, 'employer_shell'); this.messageHidden = true; }
      this.cdr.markForCheck();
    });
  }

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
    if (this.planStatus === 'trial_ending') return 'Choose a plan to publish or reopen jobs, add team members, or add screening questions.';
    if (this.planStatus === 'trial_expired') return 'Your published jobs stay published. Choose a plan to publish or reopen jobs, add team members, or add screening questions.';
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
