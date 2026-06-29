// Subscription Guardrails V4 — FE type definitions
// These are display-only types. Backend is the source of truth for all prices and entitlements.

export type BillingCycle = 'monthly' | 'annual';
export type PlanSlug = 'free_trial' | 'starter' | 'growth' | 'business';

export interface PlanPricingMonthly {
  amount: number;
  currency: string;
  label: string;
  renewalLabel: string;
}

export interface PlanPricingAnnual {
  amount: number;
  currency: string;
  dueTodayLabel: string;
  effectiveMonthlyLabel: string;
  savingsCopy: string | null;
  annualSavingsAmount: number;
  renewalLabel: string;
}

export interface PlanPricingDisplay {
  monthly: PlanPricingMonthly;
  annual: PlanPricingAnnual;
}

export interface PlanEntitlements {
  active_job_posts: number;
  admin_users: number;
  video_responses: number;
  customized_company_page: boolean;
  video_interview_questions: boolean;
  dedicated_support: boolean;
}

export interface PlanCatalogItem {
  slug: string;
  name: string;
  audience: string;
  recommended: boolean;
  trial: boolean;
  enterprise: boolean;
  current: boolean;
  pricing: PlanPricingDisplay;
  entitlements: PlanEntitlements;
  upgradeRoute: string | null;
  defaultBillingCycle: BillingCycle;
}

export interface PricingCatalog {
  annualCopy: string;
  mustDiscloseAnnualDueToday: boolean;
  upgradeLandingDefaultCycle: BillingCycle;
  monthlyAvailable: boolean;
  annualAvailable: boolean;
  plans: PlanCatalogItem[];
}

export interface PricingCatalogResponse {
  success: boolean;
  catalog: PricingCatalog;
}

// ── Entitlement usage ─────────────────────────────────────────────────────────
export type WarningLevel = 'none' | 'near_70' | 'near_90' | 'at_limit';

export interface EntitlementUsageV4 {
  key: string;
  used: number;
  limit: number | 'unlimited' | null;
  remaining: number | null;
  percentUsed: number | null;
  warningLevel: WarningLevel;
  countSource: string;
  countConfidence: 'confirmed' | 'unavailable' | string;
}

export interface BooleanEntitlementV4 {
  included: boolean;
}

// ── Subscription summary ──────────────────────────────────────────────────────
export interface SubscriptionSummaryV4Plan {
  slug: string | null;
  name: string;
  status: string;
  billingCycle: BillingCycle;
  currency: string;
  priceAmount: number | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  trialEndsAt: string | null;
  planHealth: 'healthy' | 'action_needed' | 'payment_issue' | 'unknown';
}

export interface SubscriptionSummaryV4Usage {
  active_job_posts: EntitlementUsageV4;
  admin_users: EntitlementUsageV4;
  video_responses: EntitlementUsageV4;
  customized_company_page: BooleanEntitlementV4;
  video_interview_questions: BooleanEntitlementV4;
  dedicated_support: BooleanEntitlementV4;
}

export interface SubscriptionSummaryV4 {
  plan: SubscriptionSummaryV4Plan;
  usage: SubscriptionSummaryV4Usage;
  pricingDisplay: {
    upgradeLandingDefaultCycle: BillingCycle;
    monthlyAvailable: boolean;
    annualAvailable: boolean;
    annualCopy: string;
    mustDiscloseAnnualDueToday: boolean;
  };
  recommendedPlan: {
    slug: string;
    name: string;
    upgradeRoute: string;
    defaultBillingCycle: BillingCycle;
  } | null;
  enforcementMode: string;
  billingActions: BillingAction[];
}

export interface BillingAction {
  type: string;
  label: string;
  priority: 'high' | 'medium' | 'low';
  route?: string;
}

export interface SubscriptionSummaryResponse {
  success: boolean;
  summary: SubscriptionSummaryV4;
}

// ── Checkout intent ───────────────────────────────────────────────────────────
export interface CheckoutIntentRequest {
  planSlug: string;
  billingCycle: BillingCycle;
  sourceSurface?: string;
}

export interface BillingCycleDisclosure {
  selectedPlanSlug: string;
  selectedBillingCycle: BillingCycle;
  displayPrice: string;
  amountDueToday: number;
  dueTodayLabel: string;
  renewalLabel: string;
  effectiveMonthlyPrice: number | null;
  annualSavingsAmount: number | null;
  savingsCopy: string | null;
  copyKey: string;
  disclosureVersion: string;
  checkoutUrl: string | null;
  checkoutIntentId: string | null;
}

export interface CheckoutIntentResponse {
  success: boolean;
  status: 'pending' | 'confirmed' | 'failed';
  checkoutIntentId: string;
  checkoutUrl: string | null;
  disclosure: BillingCycleDisclosure;
}
