import {
  Component, Input, Output, EventEmitter, ChangeDetectionStrategy,
} from '@angular/core';
import { Router } from '@angular/router';
import { UpgradeRecommendation } from '../../services/subscription-upgrade-recommendation.service';
import { UpgradePromptCooldownService } from '../../services/upgrade-prompt-cooldown.service';

@Component({
  selector: 'app-upgrade-prompt-card',
  template: `
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
  `,
  styleUrls: ['./upgrade-prompt-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpgradePromptCardComponent {
  @Input() recommendation: UpgradeRecommendation | null = null;
  @Input() title: string = '';
  @Input() body: string = '';
  @Input() primaryCta: string = 'Upgrade plan';
  @Input() secondaryCta: string | null = 'Not now — I\'ll review plans later.';
  @Input() variant: 'limit' | 'warn' | 'value' | 'savings' = 'value';
  @Input() showAnnualSavings = false;
  @Output() dismissed = new EventEmitter<void>();
  @Output() upgraded = new EventEmitter<void>();

  visible = true;

  constructor(
    private router: Router,
    private cooldown: UpgradePromptCooldownService,
  ) {}

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
