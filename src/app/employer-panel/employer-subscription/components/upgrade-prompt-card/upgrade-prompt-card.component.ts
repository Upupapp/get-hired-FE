import { EngagementTelemetryService } from '@main/shared/engagement/engagement-telemetry.service';
import {
  Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, OnChanges, SimpleChanges,
} from '@angular/core';
import { Router } from '@angular/router';
import { UpgradeRecommendation } from '../../services/subscription-upgrade-recommendation.service';
import { UpgradePromptCooldownService } from '../../services/upgrade-prompt-cooldown.service';
import { CtaAction, Nudge } from '@main/shared/engagement/engagement-contract.models';
import {
  PriorityPresentation, hidesAfterDismiss, navigatesAfterClick, priorityPresentation,
} from '@main/shared/engagement/engagement-message.presentation';
import { SubscriptionEngagementService } from '@main/shared/engagement/subscription-engagement.service';

@Component({
  selector: 'app-upgrade-prompt-card',
  template: `
    <!-- F2: a backend message (contract Nudge). Its words, urgency and dismissibility are the backend's. -->
    <ng-container *ngIf="message as msg; else legacyPrompt">
      <div *ngIf="visible" class="upgrade-prompt" [ngClass]="'upgrade-prompt--' + presentationOf(msg).tone" [class.upgrade-prompt--compact]="compact"
        role="region" [attr.aria-label]="msg.copy.eyebrow || 'Subscription message'" [attr.data-priority]="msg.priority">
        <div class="upgrade-prompt__body">
          <div class="upgrade-prompt__icon upgrade-prompt__icon--message" aria-hidden="true" [ngSwitch]="presentationOf(msg).tone">
            <svg *ngSwitchCase="'warning'" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 3.5l9 16H3l9-16z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
              <path d="M12 10v4M12 17h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <svg *ngSwitchCase="'notice'" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9.5" stroke="currentColor" stroke-width="1.8"/>
              <path d="M12 11v6M12 7.5h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <svg *ngSwitchCase="'info'" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9.5" stroke="currentColor" stroke-width="1.8"/>
              <path d="M12 11v6M12 7.5h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <svg *ngSwitchDefault width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9.5" stroke="currentColor" stroke-width="1.8"/>
              <path d="M12 7.5v6M12 16.5h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="upgrade-prompt__text" [attr.role]="presentationOf(msg).urgent ? 'alert' : null">
            <p class="upgrade-prompt__meta">
              <span class="upgrade-prompt__priority">{{ presentationOf(msg).label }}</span>
              <span class="upgrade-prompt__eyebrow" *ngIf="msg.copy.eyebrow">{{ msg.copy.eyebrow }}</span>
            </p>
            <p class="upgrade-prompt__title">{{ msg.copy.title }}</p>
            <p class="upgrade-prompt__copy" *ngIf="msg.copy.body">{{ msg.copy.body }}</p>
          </div>
        </div>
        <div class="upgrade-prompt__actions" *ngIf="msg.actions.length || msg.presentation.dismissible">
          <button *ngFor="let action of msg.actions" type="button" class="upgrade-prompt__btn upgrade-prompt__action"
            [ngClass]="action.type === 'PRIMARY' ? 'upgrade-prompt__btn--primary' : 'upgrade-prompt__btn--secondary'"
            [disabled]="busy" (click)="followAction(msg, action)">{{ action.label }}</button>
          <button *ngIf="msg.presentation.dismissible" type="button" class="upgrade-prompt__btn upgrade-prompt__btn--ghost upgrade-prompt__dismiss"
            [disabled]="busy" [attr.aria-label]="'Dismiss: ' + msg.copy.title" (click)="dismissMessage(msg)">Dismiss</button>
        </div>
      </div>
    </ng-container>
    <ng-template #legacyPrompt>
    <div *ngIf="visible" class="upgrade-prompt" [class]="'upgrade-prompt--' + variant" role="region" aria-label="Upgrade recommendation">
      <div class="upgrade-prompt__body">
        <div class="upgrade-prompt__icon" aria-hidden="true">
          <svg *ngIf="variant === 'limit'" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="rgba(239,68,68,0.1)"/>
            <path d="M12 8v5M12 16h.01" stroke="#dc2626" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <svg *ngIf="variant === 'warn'" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="rgba(245,158,11,0.1)"/>
            <path d="M12 8v5M12 16h.01" stroke="#b45309" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <svg *ngIf="variant === 'value'" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="rgba(108,107,173,0.1)"/>
            <path d="M9 12l2 2 4-4" stroke="#6C6BAD" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <svg *ngIf="variant === 'savings'" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="rgba(22,163,74,0.1)"/>
            <path d="M12 6v6l3 3" stroke="#16a34a" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="upgrade-prompt__text">
          <p class="upgrade-prompt__title">{{ title }}</p>
          <p class="upgrade-prompt__copy" *ngIf="body">{{ body }}</p>
          <div class="upgrade-prompt__annual-savings" *ngIf="showAnnualSavings && annualSavingsCopy" aria-label="Annual savings">
            <span class="upgrade-prompt__savings-badge">{{ annualSavingsCopy }}</span>
          </div>
        </div>
      </div>
      <div class="upgrade-prompt__actions">
        <button class="upgrade-prompt__btn upgrade-prompt__btn--primary" type="button"
          (click)="handleUpgrade()" [attr.aria-label]="primaryCta">
          {{ primaryCta }}
        </button>
        <button *ngIf="secondaryCta && !nonDismissible" class="upgrade-prompt__btn upgrade-prompt__btn--ghost"
          type="button" (click)="handleDismiss()" [attr.aria-label]="secondaryCta">
          {{ secondaryCta }}
        </button>
      </div>
    </div>
    </ng-template>
  `,
  styleUrls: ['./upgrade-prompt-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpgradePromptCardComponent implements OnChanges {
  @Input() recommendation: UpgradeRecommendation | null = null;
  @Input() title: string = '';
  @Input() body: string = '';
  @Input() primaryCta: string = 'Upgrade plan';
  @Input() secondaryCta: string | null = 'Not now — I\'ll review plans later.';
  @Input() variant: 'limit' | 'warn' | 'value' | 'savings' = 'value';
  @Input() showAnnualSavings = false;
  /** F2: a backend message. When set, it is rendered as given and the inputs above are not used. */
  @Input() message: Nudge | null = null;
  /** F5: the smaller layout for a message beside an action (CONTEXTUAL_NUDGE). */
  @Input() compact = false;
  @Output() dismissed = new EventEmitter<void>();
  @Output() upgraded = new EventEmitter<void>();

  visible = true;
  busy = false;

  constructor(
    private router: Router,
    private cooldown: UpgradePromptCooldownService,
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
    this.telemetry.record('subscription_nudge_impression', this.message, this.compact ? 'contextual' : 'dashboard');
    if (this.message.meter === 'storage') { this.telemetry.record('storage_warning_impression', this.message, this.compact ? 'contextual' : 'dashboard'); }
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.recordImpression();
    const change = changes['message'];
    if (change && !change.firstChange) {
      const before = change.previousValue as Nudge | null;
      const after = change.currentValue as Nudge | null;
      if (!before || !after || before.id !== after.id) { this.visible = true; }
    }
  }

  presentationOf(message: Nudge): PriorityPresentation {
    return priorityPresentation(message.priority);
  }

  /** Post the click, then go to the action's own url (contract §3.5). */
  followAction(message: Nudge, action: CtaAction): void {
    if (this.busy) { return; }
    this.telemetry.record('subscription_nudge_clicked', message, this.compact ? 'contextual' : 'dashboard');
    if (message.meter === 'storage' && (action.intent === 'VIEW_PLAN' || action.intent === 'COMPARE_PLANS')) { this.telemetry.record('storage_upgrade_clicked', message, this.compact ? 'contextual' : 'dashboard'); }
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
        this.telemetry.record('subscription_nudge_dismissed', message, this.compact ? 'contextual' : 'dashboard');
        this.visible = false;
        this.dismissed.emit();
      }
      this.cdr.markForCheck();
    });
  }

  get annualSavingsCopy(): string | null {
    if (!this.recommendation || !this.recommendation.recommendedPlan) return null;
    const plan = this.recommendation.recommendedPlan;
    return 'Save ₱' + plan.annualSavingsPhp.toLocaleString() + ' with annual billing';
  }

  get nonDismissible(): boolean {
    const trigger = this.recommendation && this.recommendation.trigger;
    return trigger ? this.cooldown.isNonDismissible(trigger) : false;
  }

  get upgradeRoute(): string {
    if (this.recommendation && this.recommendation.recommendedPlan) {
      return this.recommendation.recommendedPlan.route;
    }
    return '/recruiter/subscription';
  }

  handleUpgrade(): void {
    this.upgraded.emit();
    this.router.navigate([this.upgradeRoute]);
  }

  handleDismiss(): void {
    const trigger = this.recommendation && this.recommendation.trigger;
    if (trigger) this.cooldown.dismiss(trigger);
    this.visible = false;
    this.dismissed.emit();
  }
}
