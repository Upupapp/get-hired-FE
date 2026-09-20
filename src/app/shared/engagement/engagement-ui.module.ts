import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubscriptionStatusBannerComponent } from '@main/employer-panel/employer-subscription/components/subscription-status-banner/subscription-status-banner.component';
import { UpgradePromptCardComponent } from '@main/employer-panel/employer-subscription/components/upgrade-prompt-card/upgrade-prompt-card.component';
import { TrialDaysRemainingBadgeComponent } from '@main/employer-panel/employer-subscription/components/trial-days-remaining-badge/trial-days-remaining-badge.component';
import { SubscriptionUsageMeterComponent } from '@main/employer-panel/employer-subscription/components/subscription-usage-meter/subscription-usage-meter.component';
import { EngagementShellBannerComponent } from './engagement-shell-banner.component';
import { TrialStatusWidgetComponent } from './trial-status-widget.component';
import { EngagementContextualNudgeComponent } from './engagement-contextual-nudge.component';
import { EngagementFeatureLockComponent } from './engagement-feature-lock.component';

/**
 * The engagement message components, declared once so the employer shell and the subscription pages
 * can both render them (F2). They were declared in the lazy EmployerSubscriptionModule, which the
 * shell cannot reach. F4 adds the trial badge, the usage meter and the trial widget, for the dashboard.
 */
import { EngagementDashboardCardComponent } from './engagement-dashboard-card.component';

const COMPONENTS = [
  SubscriptionStatusBannerComponent, UpgradePromptCardComponent, EngagementShellBannerComponent,
  TrialDaysRemainingBadgeComponent, SubscriptionUsageMeterComponent, TrialStatusWidgetComponent,
  EngagementContextualNudgeComponent, EngagementFeatureLockComponent, EngagementDashboardCardComponent,
];

@NgModule({
  declarations: COMPONENTS,
  imports: [CommonModule],
  exports: COMPONENTS,
})
export class EngagementUiModule {}
