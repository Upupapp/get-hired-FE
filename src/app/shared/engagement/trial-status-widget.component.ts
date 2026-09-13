import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { SubscriptionUpgradeRecommendationService } from '@main/employer-panel/employer-subscription/services/subscription-upgrade-recommendation.service';
import { EntitlementUsageV4, RecruitmentStorageUsageV4 } from '@main/employer-panel/employer-subscription/subscription-v4.models';
import { EngagementContext, EngagementSubscription, EngagementUsageKey } from './engagement-contract.models';
import { SubscriptionEngagementService } from './subscription-engagement.service';

export interface TrialWidgetMeter {
  key: EngagementUsageKey;
  label: string;
  kind: 'count' | 'storage';
  usage: EntitlementUsageV4 | RecruitmentStorageUsageV4;
}

export interface TrialWidgetView {
  trial: NonNullable<EngagementSubscription['trial']>;
  planSlug: string | null;
  meters: TrialWidgetMeter[];
}

/** The meters the context serves, in a fixed order. A meter the context does not carry is left out. */
const METERS: Array<{ key: EngagementUsageKey; label: string; kind: 'count' | 'storage' }> = [
  { key: 'active_job_posts', label: 'Active jobs', kind: 'count' },
  { key: 'admin_users', label: 'Team members', kind: 'count' },
  { key: 'video_responses', label: 'Video responses', kind: 'count' },
  { key: 'recruitment_storage', label: 'Recruitment Storage', kind: 'storage' },
];

/** TRIAL_STATUS_WIDGET (contract §6): shown whenever `subscription.trial` is set, with the context's meters. */
export function trialWidgetView(context: EngagementContext | null): TrialWidgetView | null {
  const subscription = context ? context.subscription : null;
  if (!context || !subscription || !subscription.trial) { return null; }
  const usage = context.usage || {};
  const meters = METERS.filter(meter => !!usage[meter.key]).map((meter): TrialWidgetMeter => {
    const served = usage[meter.key]!;
    const shaped = meter.kind === 'storage'
      ? { ...served, storageStatus: served.storageStatus === undefined ? null : served.storageStatus } as RecruitmentStorageUsageV4
      : served as EntitlementUsageV4;
    return { ...meter, usage: shaped };
  });
  return { trial: subscription.trial, planSlug: subscription.planSlug, meters };
}

/**
 * The trial status widget on the employer dashboard (F4). It sits beside the dashboard's existing
 * upgrade nudge and replaces nothing (RUL-13). Outside the employer shell, and on the server, the
 * context is null, so it reads and renders nothing.
 */
@Component({
  selector: 'app-trial-status-widget',
  template: `
    <section class="gh-trial-widget" *ngIf="view$ | async as view" aria-label="Free trial">
      <div class="gh-trial-widget__header">
        <p class="gh-trial-widget__title">Free trial</p>
        <app-trial-days-remaining-badge [status]="view.trial.status" [daysRemaining]="view.trial.daysRemaining"></app-trial-days-remaining-badge>
      </div>
      <div class="gh-trial-widget__meters" *ngIf="view.meters.length">
        <app-subscription-usage-meter *ngFor="let meter of view.meters; trackBy: trackMeter"
          [label]="meter.label" [kind]="meter.kind" [usage]="meter.usage"></app-subscription-usage-meter>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    .gh-trial-widget { margin: 16px 0; padding: 16px 18px; background: #fff; border: 1px solid var(--gh-border, #E5E7EB); border-radius: 14px; }
    .gh-trial-widget__header { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px 12px; }
    .gh-trial-widget__title { margin: 0; font-size: 14px; font-weight: 700; color: #111827; }
    .gh-trial-widget__meters { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px 16px; margin-top: 14px; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrialStatusWidgetComponent {
  readonly view$: Observable<TrialWidgetView | null>;

  private impressionFor: string | null = null;

  constructor(engagement: SubscriptionEngagementService, private analytics: SubscriptionUpgradeRecommendationService) {
    this.view$ = engagement.context$.pipe(map(trialWidgetView), tap(view => this.recordImpression(view)));
  }

  trackMeter(_index: number, meter: TrialWidgetMeter): string {
    return meter.key;
  }

  /** trial_notice_impression once per render: when a trial is first shown, and again only when its status changes. */
  private recordImpression(view: TrialWidgetView | null): void {
    const shown = view ? view.trial.status : null;
    if (view && shown !== this.impressionFor) {
      this.analytics.recordEvent('trial_notice_impression', { surface: 'dashboard', lifecycleStatus: view.trial.status, currentPlan: view.planSlug });
    }
    this.impressionFor = shown;
  }
}
