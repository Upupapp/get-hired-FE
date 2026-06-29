import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

export interface RecommendedPlanMeta {
  slug: string;
  name: string;
  route: string;
  defaultBillingCycle: 'annual' | 'monthly';
  monthlyPricePhp: number;
  annualPricePhp: number;
  annualEffectiveMonthlyPhp: number;
  annualSavingsPhp: number;
  annualDueTodayPhp: number;
  limits: { activeJobs: number; adminUsers: number; videoResponses: number };
}

export interface StarterOption {
  slug: string;
  name: string;
  route: string;
  monthlyPricePhp: number;
  annualPricePhp: number;
  annualEffectiveMonthlyPhp: number;
  limits: { activeJobs: number; adminUsers: number; videoResponses: number };
}

export interface BillingOptionMeta {
  available: boolean;
  tabLabel: string;
  displayPrice: string;
  helper: string;
  amountDueToday?: string;
  savingsAmount?: number;
  savingsCopy?: string;
}

export interface UpgradeComparison {
  activeJobs: { current: number | string; recommended: number | string; used?: number | null };
  adminUsers: { current: number | string; recommended: number | string };
  videoResponses: { current: number | string; recommended: number | string };
  customizedCompanyPage: { current: boolean; recommended: boolean };
  videoInterviewQuestions: { current: boolean; recommended: boolean };
  dedicatedSupport: { current: boolean; recommended: boolean };
}

export interface UpgradeRecommendation {
  showPrompt: boolean;
  trigger: string;
  priority: number;
  copyKey: string;
  primaryCta: string;
  secondaryCta: string | null;
  currentPlan: { slug: string; name: string; billingCycle?: string; lifecycleStatus?: string };
  recommendedPlan: RecommendedPlanMeta | null;
  starterOption: StarterOption | null;
  billingOptions: { annual: BillingOptionMeta; monthly: BillingOptionMeta } | null;
  comparison: UpgradeComparison | null;
  usageSnapshot: Record<string, number> | null;
  isEnterprise?: boolean;
  analytics: { eventName: string; safeProperties: Record<string, any> };
}

export interface UpgradeRecommendationResponse {
  success: boolean;
  recommendation: UpgradeRecommendation;
}

@Injectable({ providedIn: 'root' })
export class SubscriptionUpgradeRecommendationService {
  private base = environment.api_url;

  constructor(private http: HttpClient) {}

  getRecommendation(trigger?: string, surface?: string): Observable<UpgradeRecommendationResponse> {
    let url = `${this.base}/api/subscriptions/upgrade-recommendation`;
    const params: string[] = [];
    if (trigger) params.push(`trigger=${encodeURIComponent(trigger)}`);
    if (surface) params.push(`surface=${encodeURIComponent(surface)}`);
    if (params.length) url += '?' + params.join('&');
    return this.http.get<UpgradeRecommendationResponse>(url);
  }

  recordEvent(eventName: string, properties: Record<string, any> = {}): void {
    this.http.post(`${this.base}/api/subscriptions/upgrade-analytics`, {
      eventName,
      properties,
    }).subscribe({ error: () => {} }); // fire-and-forget
  }
}
