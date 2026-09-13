import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubscriptionStatusBannerComponent } from '@main/employer-panel/employer-subscription/components/subscription-status-banner/subscription-status-banner.component';
import { UpgradePromptCardComponent } from '@main/employer-panel/employer-subscription/components/upgrade-prompt-card/upgrade-prompt-card.component';
import { EngagementShellBannerComponent } from './engagement-shell-banner.component';

/**
 * The engagement message components, declared once so the employer shell and the subscription pages
 * can both render them (F2). They were declared in the lazy EmployerSubscriptionModule, which the
 * shell cannot reach.
 */
@NgModule({
  declarations: [SubscriptionStatusBannerComponent, UpgradePromptCardComponent, EngagementShellBannerComponent],
  imports: [CommonModule],
  exports: [SubscriptionStatusBannerComponent, UpgradePromptCardComponent, EngagementShellBannerComponent],
})
export class EngagementUiModule {}
