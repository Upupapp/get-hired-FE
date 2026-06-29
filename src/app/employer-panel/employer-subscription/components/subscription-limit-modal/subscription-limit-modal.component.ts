import { Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface SubscriptionLimitModalData {
  entitlementKey: string;
  used: number;
  limit: number | 'unlimited';
  warningLevel: 'near_70' | 'near_90' | 'at_limit';
  userMessage: string;
  upgradeRoute: string;
  recommendedPlanSlug: string;
  recommendedPlanName: string;
  unlocks: string[];
}

@Component({
  selector: 'app-subscription-limit-modal',
  template: `
    <div class="limit-modal" role="dialog" aria-modal="true" [attr.aria-label]="'Subscription limit: ' + entitlementLabel">
      <!-- Header -->
      <div class="limit-modal__header">
        <div class="limit-modal__icon" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              stroke="#FF7062" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 9v4M12 17h.01" stroke="#FF7062" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <button class="limit-modal__close" type="button" mat-dialog-close aria-label="Close dialog">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <!-- Body -->
      <div class="limit-modal__body">
        <h2 class="limit-modal__title">{{ limitTitle }}</h2>
        <p class="limit-modal__message">{{ data.userMessage }}</p>

        <!-- Usage indicator -->
        <div class="limit-modal__meter" role="img" [attr.aria-label]="entitlementLabel + ': ' + data.used + ' of ' + data.limit + ' used'">
          <div class="limit-modal__meter-track">
            <div class="limit-modal__meter-fill" [style.width.%]="fillPercent"></div>
          </div>
          <div class="limit-modal__meter-label">
            <span>{{ data.used }} used</span>
            <span>{{ data.limit === 'unlimited' ? 'Unlimited' : data.limit + ' included' }}</span>
          </div>
        </div>

        <!-- Upgrade unlocks -->
        <div class="limit-modal__unlocks" *ngIf="data.unlocks?.length">
          <p class="limit-modal__unlocks-label">{{ data.recommendedPlanName }} plan includes:</p>
          <ul class="limit-modal__unlocks-list" aria-label="Plan features">
            <li *ngFor="let item of data.unlocks">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M20 6L9 17l-5-5" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              {{ item }}
            </li>
          </ul>
        </div>

        <!-- Preserve work notice -->
        <div class="limit-modal__preserve">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2zM17 21v-8H7v8M7 3v5h8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>Your work has been saved as a draft.</span>
        </div>
      </div>

      <!-- Actions -->
      <div class="limit-modal__actions">
        <button class="limit-modal__btn limit-modal__btn--primary" type="button" (click)="handleUpgrade()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 15l7-7 7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          Upgrade plan
        </button>
        <button class="limit-modal__btn limit-modal__btn--ghost" type="button" mat-dialog-close>
          Keep as draft
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./subscription-limit-modal.component.scss']
})
export class SubscriptionLimitModalComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: SubscriptionLimitModalData,
    private dialogRef: MatDialogRef<SubscriptionLimitModalComponent>,
    private router: Router
  ) {}

  get entitlementLabel(): string {
    const map: Record<string, string> = {
      active_job_posts: 'Active job posts',
      admin_users: 'Admin users',
      video_responses: 'Video responses',
    };
    return map[this.data.entitlementKey] || this.data.entitlementKey;
  }

  get limitTitle(): string {
    if (this.data.warningLevel === 'at_limit') return this.entitlementLabel + ' limit reached';
    if (this.data.warningLevel === 'near_90') return 'Almost at your ' + this.entitlementLabel.toLowerCase() + ' limit';
    return this.entitlementLabel + ' limit';
  }

  get fillPercent(): number {
    if (this.data.limit === 'unlimited') return 0;
    const lim = this.data.limit as number;
    if (!lim) return 0;
    return Math.min(100, (this.data.used / lim) * 100);
  }

  handleUpgrade(): void {
    this.dialogRef.close('upgrade');
    this.router.navigate([this.data.upgradeRoute || '/recruiter/subscription/upgrade/growth']);
  }
}
