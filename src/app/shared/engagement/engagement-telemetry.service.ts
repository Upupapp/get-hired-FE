import { Injectable } from '@angular/core';
import { SubscriptionUpgradeRecommendationService } from '@main/employer-panel/employer-subscription/services/subscription-upgrade-recommendation.service';
import { Nudge } from './engagement-contract.models';

/** Presentation events use the existing E2 analytics sink. No user or candidate objects enter it. */
@Injectable({ providedIn: 'root' })
export class EngagementTelemetryService {
  constructor(private analytics: SubscriptionUpgradeRecommendationService) {}
  record(event: string, message: Nudge, surface: string): void {
    this.analytics.recordEvent(event, {
      trigger: message.trigger, ruleKey: message.ruleKey, priority: message.priority,
      currentPlan: message.recommendation?.currentPlan ?? null,
      recommendedPlan: message.recommendation?.targetPlan ?? null,
      surface, usagePercent: message.usage?.percentage ?? null,
    });
  }
}
