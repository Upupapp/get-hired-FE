import { Component, Input, OnChanges, AfterViewInit, ElementRef, ViewChild, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { EntitlementUsageV4, RecruitmentStorageUsageV4, StorageStatus } from '../../subscription-v4.models';
import { formatStorage } from '../../plan-presentation.model';

/**
 * Copy for the backend's Recruitment Storage bands. None of it may suggest that anything an
 * employer already received is removed (reaching the limit deletes nothing), nor that anything
 * stops: since gh-be A3.1 no application or file is refused over storage, so going past the
 * capacity only means the plan is exceeded.
 */
export const STORAGE_NOTES: Record<StorageStatus, string | null> = {
  normal: null,
  notice: 'You have used at least 70% of your Recruitment Storage.',
  warning: 'You have used at least 80% of your Recruitment Storage.',
  critical: 'You have used at least 90% of your Recruitment Storage. Upgrade soon for more capacity.',
  full: "You've reached or gone past your plan's Recruitment Storage capacity. New applications and their files still arrive, and your existing applications and candidate media stay safe. Upgrade for more capacity.",
  no_plan: 'Your account has no plan yet, so it includes no Recruitment Storage. Choose a plan to add capacity.',
};

/**
 * Shown whenever the backend could not count storage, for whatever reason, in place of
 * figures and any band: "0 GB used" or a warning would both be false.
 */
export const STORAGE_UNAVAILABLE_NOTE = 'Storage usage unavailable.';

const STORAGE_FILL: Record<StorageStatus, string> = {
  normal: 'usage-meter__fill--healthy',
  notice: 'usage-meter__fill--caution',
  warning: 'usage-meter__fill--warning',
  critical: 'usage-meter__fill--critical',
  full: 'usage-meter__fill--critical',
  no_plan: '',
};

@Component({
  selector: 'app-subscription-usage-meter',
  template: `
    <div class="usage-meter" [class.usage-meter--storage]="kind === 'storage'" [attr.aria-label]="ariaSummary">
      <div class="usage-meter__header">
        <span class="usage-meter__label" *ngIf="showLabel">{{ label }}</span>
        <span class="usage-meter__count" [ngClass]="countClass" *ngIf="!storageUnavailable && !noPlan">
          {{ usedLabel }}
          <span class="usage-meter__of" aria-hidden="true"> / {{ limitLabel }}</span>
        </span>
      </div>
      <div class="usage-meter__track" role="progressbar" *ngIf="showTrack"
        [attr.aria-valuenow]="ariaValueNow"
        [attr.aria-valuemin]="0"
        [attr.aria-valuemax]="ariaValueMax"
        [attr.aria-valuetext]="kind === 'storage' ? usedLabel + ' of ' + limitLabel : null"
        [attr.aria-label]="label + ' usage'">
        <div class="usage-meter__fill"
          [ngClass]="fillClass"
          [style.width.%]="animatedPercent">
        </div>
      </div>
      <div class="usage-meter__warning" *ngIf="kind === 'count' && (usage?.warningLevel === 'near_90' || usage?.warningLevel === 'at_limit')" role="alert" aria-live="polite">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span *ngIf="usage?.warningLevel === 'at_limit'">Limit reached. Upgrade to continue.</span>
        <span *ngIf="usage?.warningLevel === 'near_90'">Approaching limit.</span>
      </div>
      <p class="usage-meter__note" *ngIf="storageNote" [ngClass]="noteClass" role="status">{{ storageNote }}</p>
    </div>
  `,
  styleUrls: ['./subscription-usage-meter.component.scss']
})
export class SubscriptionUsageMeterComponent implements OnChanges, AfterViewInit {
  @Input() label: string = '';
  @Input() usage: EntitlementUsageV4 | RecruitmentStorageUsageV4 | null = null;
  /**
   * 'storage' reads a Recruitment Storage block: `used` and `limit` are bytes, and the
   * band comes from the backend's `storageStatus`, never from thresholds re-derived here.
   */
  @Input() kind: 'count' | 'storage' = 'count';
  /** Off when the surrounding card already names the meter in its own header; the label still names it to assistive tech. */
  @Input() showLabel = true;

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
    if (this.kind === 'storage') return this.storagePercent || 0;
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
    if (this.kind === 'storage') return this.usage.limit === null ? 'Custom' : (formatStorage(this.usage.limit) || '–');
    if (this.usage.limit === null) return '–';
    return String(this.usage.limit);
  }

  get usedLabel(): string {
    const used = (this.usage && this.usage.used) || 0;
    return this.kind === 'storage' ? (formatStorage(used) || '–') : String(used);
  }

  get ariaSummary(): string {
    if (this.storageUnavailable) return this.label + ': usage unavailable';
    if (this.noPlan) return this.label + ': no plan';
    return this.label + ': ' + this.usedLabel + ' of ' + this.limitLabel + ' used';
  }

  get ariaValueNow(): number {
    return this.kind === 'storage' ? (this.storagePercent || 0) : ((this.usage && this.usage.used) || 0);
  }

  get ariaValueMax(): number {
    return this.kind === 'storage' ? 100 : (this.limitNum || 100);
  }

  get fillClass(): string {
    if (!this.usage) return '';
    if (this.kind === 'storage') return this.storageStatus && !this.storageUnavailable ? STORAGE_FILL[this.storageStatus] : '';
    if (this.usage.warningLevel === 'at_limit') return 'usage-meter__fill--critical';
    if (this.usage.warningLevel === 'near_90') return 'usage-meter__fill--warning';
    if (this.usage.warningLevel === 'near_70') return 'usage-meter__fill--caution';
    return 'usage-meter__fill--healthy';
  }

  get countClass(): string {
    if (!this.usage) return '';
    if (this.kind === 'storage') {
      if (this.storageUnavailable) return '';
      if (this.storageStatus === 'critical' || this.storageStatus === 'full') return 'usage-meter__count--critical';
      if (this.storageStatus === 'warning') return 'usage-meter__count--warning';
      return '';
    }
    if (this.usage.warningLevel === 'at_limit') return 'usage-meter__count--critical';
    if (this.usage.warningLevel === 'near_90') return 'usage-meter__count--warning';
    return '';
  }

  // ── Recruitment Storage ─────────────────────────────────────────────────────

  get storageStatus(): StorageStatus | null {
    if (this.kind !== 'storage' || !this.usage) return null;
    return (this.usage as RecruitmentStorageUsageV4).storageStatus || null;
  }

  /**
   * The backend could not count storage. It says so twice: countConfidence is not
   * 'confirmed', and storageStatus is null. Either signal is enough, because an uncounted
   * block carries a placeholder `used` of 0 and, with a zero limit, a warningLevel of
   * at_limit, and neither may reach the screen as a figure or a band.
   */
  get storageUnavailable(): boolean {
    if (this.kind !== 'storage') return false;
    if (!this.usage || this.storageStatus === null) return true;
    return this.usage.countConfidence !== 'confirmed';
  }

  /**
   * gh-be A2.3: a limit of exactly 0 means the account has no plan. That is a choose-a-plan
   * state with no figures and no bar, never "0 GB of 0 GB, full", whatever is stored.
   */
  get noPlan(): boolean {
    return this.storageStatus === 'no_plan' && !this.storageUnavailable;
  }

  /** The backend's percentUsed; a full bar when the status is full. */
  get storagePercent(): number | null {
    if (this.storageUnavailable || this.noPlan || !this.usage) return null;
    if (this.storageStatus === 'full') return 100;
    const pct = this.usage.percentUsed;
    return typeof pct === 'number' ? Math.min(100, Math.max(0, pct)) : null;
  }

  /** Enterprise sends no limit and no percentage: its storage is custom, so there is no bar to fill. */
  get showTrack(): boolean {
    return this.kind === 'count' || this.storagePercent !== null;
  }

  get storageNote(): string | null {
    if (this.kind !== 'storage') return null;
    if (this.storageUnavailable) return STORAGE_UNAVAILABLE_NOTE;
    return STORAGE_NOTES[this.storageStatus as StorageStatus];
  }

  get noteClass(): string {
    return 'usage-meter__note--' + (this.storageUnavailable ? 'unavailable' : this.storageStatus);
  }
}
