import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { SubscriptionUpgradeRecommendationService } from '@main/employer-panel/employer-subscription/services/subscription-upgrade-recommendation.service';
import { CtaAction, EngagementContext, FeatureCapability, LockableFeature } from './engagement-contract.models';
import { SubscriptionEngagementService } from './subscription-engagement.service';

export type FeatureLockView = FeatureCapability & { nudge: NonNullable<FeatureCapability['nudge']> };

/**
 * LOCKED_FEATURE_STATE (contract §6): the served entitlement result for one feature, when the backend says it is not
 * allowed and sends the words to show. Anything else (allowed, unknown, no copy, no context) is null, and nothing shows.
 */
export function featureLock(context: EngagementContext | null, feature: LockableFeature | null): FeatureLockView | null {
  const features = context && context.capabilities ? context.capabilities.features : null;
  const capability = features && feature ? features[feature] : null;
  return capability && capability.allowed === false && capability.nudge ? capability as FeatureLockView : null;
}

/**
 * A feature lock (F7). It only displays the backend's `allowed` flag: it never disables, hides or blocks the feature,
 * and a refused action still answers with B5's 402 dialog. It never redirects; its one action goes, on the viewer's
 * click, to the url the backend served (ESC-09).
 */
@Component({
  selector: 'app-engagement-feature-lock',
  template: `
    <section class="gh-feature-lock" *ngIf="lock$ | async as lock" role="region" [attr.aria-label]="lock.nudge.title" [attr.data-feature]="lock.key">
      <span class="gh-feature-lock__icon" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" stroke-width="2"/>
          <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </span>
      <div class="gh-feature-lock__text">
        <p class="gh-feature-lock__title">{{ lock.nudge.title }}</p>
        <p class="gh-feature-lock__body">{{ lock.nudge.body }}</p>
      </div>
      <button *ngIf="lock.nudge.primaryCTA as cta" type="button" class="gh-feature-lock__cta" (click)="follow(lock, cta)">{{ cta.label }}</button>
    </section>
  `,
  styles: [`
    :host { display: block; }
    .gh-feature-lock { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 14px; margin: 0 0 14px; padding: 12px 14px;
      background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 12px; color: #1F2937; }
    .gh-feature-lock__icon { display: inline-flex; color: #4B4A8C; }
    .gh-feature-lock__text { flex: 1 1 240px; min-width: 0; }
    .gh-feature-lock__title { margin: 0; font-size: 13px; font-weight: 700; }
    .gh-feature-lock__body { margin: 2px 0 0; font-size: 12px; color: #4B5563; }
    .gh-feature-lock__cta { min-height: 36px; padding: 0 14px; border-radius: 10px; border: 1.5px solid rgba(108, 107, 173, 0.45);
      background: #fff; color: #4B4A8C; font-size: 13px; font-weight: 700; cursor: pointer; }
    .gh-feature-lock__cta:focus-visible { outline: 2px solid #6C6BAD; outline-offset: 2px; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EngagementFeatureLockComponent {
  /** The catalog feature this lock is about. `dedicated_support` has no in-product surface and is mounted nowhere. */
  @Input() feature: LockableFeature | null = null;

  readonly lock$: Observable<FeatureLockView | null>;

  private impressionFor: string | null = null;

  constructor(
    engagement: SubscriptionEngagementService,
    private router: Router,
    private analytics: SubscriptionUpgradeRecommendationService,
  ) {
    this.lock$ = engagement.context$.pipe(
      map(context => featureLock(context, this.feature)),
      tap(lock => this.recordImpression(lock)),
    );
  }

  /** Only on the viewer's click, and only to the url the backend served (ESC-09). */
  follow(lock: FeatureLockView, action: CtaAction): void {
    this.analytics.recordEvent('feature_gate_upgrade_clicked', { feature: lock.key });
    this.router.navigateByUrl(action.url);
  }

  /** feature_gate_impression once per render, carrying the catalog feature key (contract §8). */
  private recordImpression(lock: FeatureLockView | null): void {
    const shown = lock ? lock.key : null;
    if (lock && shown !== this.impressionFor) {
      this.analytics.recordEvent('feature_gate_impression', { feature: lock.key });
    }
    this.impressionFor = shown;
  }
}
