import { Component, Input, OnChanges, AfterViewInit, ElementRef, ViewChild, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { EntitlementUsageV4 } from '../../subscription-v4.models';

@Component({
  selector: 'app-subscription-usage-meter',
  template: `
    <div class="usage-meter" [attr.aria-label]="label + ': ' + (usage?.used || 0) + ' of ' + limitLabel + ' used'">
      <div class="usage-meter__header">
        <span class="usage-meter__label">{{ label }}</span>
        <span class="usage-meter__count" [ngClass]="countClass">
          {{ usage?.used || 0 }}
          <span class="usage-meter__of" aria-hidden="true"> / {{ limitLabel }}</span>
        </span>
      </div>
      <div class="usage-meter__track" role="progressbar"
        [attr.aria-valuenow]="usage?.used || 0"
        [attr.aria-valuemin]="0"
        [attr.aria-valuemax]="limitNum || 100"
        [attr.aria-label]="label + ' usage'">
        <div class="usage-meter__fill"
          [ngClass]="fillClass"
          [style.width.%]="animatedPercent">
        </div>
      </div>
      <div class="usage-meter__warning" *ngIf="usage?.warningLevel === 'near_90' || usage?.warningLevel === 'at_limit'" role="alert" aria-live="polite">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span *ngIf="usage?.warningLevel === 'at_limit'">Limit reached. Upgrade to continue.</span>
        <span *ngIf="usage?.warningLevel === 'near_90'">Approaching limit.</span>
      </div>
    </div>
  `,
  styleUrls: ['./subscription-usage-meter.component.scss']
})
export class SubscriptionUsageMeterComponent implements OnChanges, AfterViewInit {
  @Input() label: string = '';
  @Input() usage: EntitlementUsageV4 | null = null;

  animatedPercent: number = 0;
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnChanges(): void {
    // Reset before animating to new value
    this.animatedPercent = 0;
    if (this.isBrowser) {
      setTimeout(() => { this.animatedPercent = this.targetPercent; }, 60);
    } else {
      this.animatedPercent = this.targetPercent;
    }
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      setTimeout(() => { this.animatedPercent = this.targetPercent; }, 60);
    }
  }

  get targetPercent(): number {
    if (!this.usage) return 0;
    if (this.usage.limit === 'unlimited') return 0;
    if (!this.usage.limit || this.usage.limit === null) return 0;
    const pct = (this.usage.used / (this.usage.limit as number)) * 100;
    return Math.min(100, pct);
  }

  get limitNum(): number | null {
    if (!this.usage || this.usage.limit === 'unlimited' || this.usage.limit === null) return null;
    return this.usage.limit as number;
  }

  get limitLabel(): string {
    if (!this.usage) return '–';
    if (this.usage.limit === 'unlimited') return 'Unlimited';
    if (this.usage.limit === null) return '–';
    return String(this.usage.limit);
  }

  get fillClass(): string {
    if (!this.usage) return '';
    if (this.usage.warningLevel === 'at_limit') return 'usage-meter__fill--critical';
    if (this.usage.warningLevel === 'near_90') return 'usage-meter__fill--warning';
    if (this.usage.warningLevel === 'near_70') return 'usage-meter__fill--caution';
    return 'usage-meter__fill--healthy';
  }

  get countClass(): string {
    if (!this.usage) return '';
    if (this.usage.warningLevel === 'at_limit') return 'usage-meter__count--critical';
    if (this.usage.warningLevel === 'near_90') return 'usage-meter__count--warning';
    return '';
  }
}
