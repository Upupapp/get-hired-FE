import { AppNotification } from '@main/shared/services/notification.service';
import { StorageStatus, WarningLevel } from '@main/employer-panel/employer-subscription/subscription-v4.models';

/**
 * The engagement API as gh-be serves it: SUBSCRIPTION_ENGAGEMENT_API_CONTRACT.md at 658d0a5 (SPRINT-02 E2).
 *
 * Field names are the contract's, and each union below is one of its `enum:` blocks, value for value.
 * src/testing/engagement-contract.fixture.ts types every tagged JSON example in the contract against these,
 * so a field added, removed or renamed on either side stops the spec build.
 */

export type EngagementPriority = 'INFO' | 'NOTICE' | 'WARNING' | 'HIGH' | 'CRITICAL';

export type EngagementSurface =
  | 'IN_APP_NOTIFICATION' | 'INLINE_CARD' | 'DASHBOARD_CARD' | 'PAGE_BANNER' | 'CONTEXTUAL_NUDGE'
  | 'LIMIT_MODAL' | 'TOAST' | 'EMAIL' | 'BILLING_ALERT' | 'ADMIN_ALERT' | 'SALES_SIGNAL';

export type MessageClass = 'OPERATIONAL' | 'EXPANSION';

export type MessageKind = 'LIMIT_REACHED' | 'USAGE_WARNING' | 'USAGE_NOTICE' | 'PLAN_UPGRADE';

export type EngagementTrigger = 'STORAGE_100' | 'STORAGE_90' | 'STORAGE_80' | 'STORAGE_70' | 'JOB_100' | 'JOB_80' | 'USER_100';

export type NotificationCategory = 'HIRING' | 'APPLICATIONS' | 'MESSAGES' | 'SUBSCRIPTION' | 'BILLING' | 'ACCOUNT';

export type NotificationStatus = 'PENDING' | 'DELIVERED' | 'READ' | 'CLICKED' | 'DISMISSED' | 'EXPIRED';

export type NotificationListStatus = 'UNREAD' | 'READ' | 'ALL';

export type CtaType = 'PRIMARY' | 'SECONDARY';

export type CtaActionKind = 'NAVIGATE';

/** An intent the contract routes to `none` has no screen yet, and the backend never sends it. */
export type CtaIntent =
  | 'COMPARE_PLANS' | 'VIEW_PLAN' | 'MANAGE_JOBS' | 'MANAGE_TEAM'
  | 'MANAGE_STORAGE' | 'ADD_STORAGE' | 'CONTACT_SALES' | 'UPDATE_PAYMENT_METHOD';

export type LifecycleStatusValue =
  | 'unknown' | 'trialing' | 'trial_expired' | 'trial_ending' | 'active' | 'grace_period' | 'expired'
  | 'renewal_due_soon' | 'pending_payment' | 'payment_failed' | 'past_due' | 'canceled' | 'no_subscription_found';

export type LockableFeature = 'customized_company_page' | 'video_interview_questions' | 'dedicated_support';

export type CapabilityFlag = 'storageWarnings' | 'storageAddOns' | 'featureGateUpgrade' | 'enterpriseSignals';

export type DegradedPart = 'subscription' | 'usage' | 'messages' | 'unreadCounts';

export type EngagementErrorCode =
  | 'INVALID_QUERY' | 'INVALID_NOTIFICATION_ID' | 'INVALID_INTENT' | 'NOT_DISMISSIBLE' | 'NOTIFICATIONS_UNAVAILABLE';

export type NudgeMeter = 'storage' | 'jobs' | 'seats';

export type NudgeUsageUnit = 'GB' | 'active_jobs' | 'employer_users';

export type RecommendationReason = 'STORAGE_CAPACITY' | 'JOB_CAPACITY' | 'USER_CAPACITY';

/** `url` is a frontend route that exists. Send the click first, then navigate to it (contract §3.5). */
export interface CtaAction {
  type: CtaType;
  label: string;
  action: CtaActionKind;
  intent: CtaIntent;
  url: string;
}

/** One message (contract §4.2). Its words are final: render them as given, never assemble them. */
export interface Nudge {
  /** `nudge:<ruleKey>`: pass it to dismiss and click. */
  id: string;
  kind: MessageKind;
  ruleKey: string;
  trigger: EngagementTrigger;
  meter: NudgeMeter;
  priority: EngagementPriority;
  messageClass: MessageClass;
  presentation: {
    recommendedSurface: EngagementSurface;
    surfaces: EngagementSurface[];
    /** false means no dismiss control. */
    dismissible: boolean;
  };
  copy: { eyebrow: string; title: string; body: string };
  usage: {
    used: number;
    limit: number;
    unit: NudgeUsageUnit;
    percentage: number;
    status: StorageStatus | null;
  } | null;
  /** null for a viewer who is not a billing viewer. */
  recommendation: {
    currentPlan: string;
    targetPlan: string | null;
    targetPlanName: string | null;
    reason: RecommendationReason;
    benefit: { unit: NudgeUsageUnit; current: number; target: number } | null;
  } | null;
  /** `ask_billing_owner` for a viewer who is not a billing viewer. */
  escalation: 'ask_billing_owner' | null;
  /** 0 to 2, PRIMARY first. */
  actions: CtaAction[];
}

/** `context.subscription`: what TRIAL_STATUS_WIDGET reads. */
export interface EngagementSubscription {
  planSlug: string | null;
  planName: string | null;
  status: LifecycleStatusValue;
  /** Billing viewers only; null for everyone else. */
  billingCycle: string | null;
  periodEnd: string | null;
  /** null unless the status is trialing, trial_ending or trial_expired. */
  trial: {
    status: 'trialing' | 'trial_ending' | 'trial_expired';
    endsAt: string;
    /** Whole days left, rounded up, never below 0. Render it; never compute it. */
    daysRemaining: number;
    /** The catalog's trial length. Never hard-code it. */
    lengthDays: number;
  } | null;
}

/** One meter in the employer summary's shape. Storage figures are bytes; anything but `confirmed` is unmeasured, not zero. */
export interface EngagementUsageMeter {
  key: string;
  used: number;
  limit: number | 'unlimited' | null;
  remaining: number | null;
  percentUsed: number | null;
  warningLevel: WarningLevel;
  countSource: string;
  countConfidence: 'confirmed' | 'unavailable' | 'error';
  storageStatus?: StorageStatus | null;
}

export type EngagementUsageKey = 'active_job_posts' | 'admin_users' | 'video_responses' | 'recruitment_storage';

export type EngagementUsage = Partial<Record<EngagementUsageKey, EngagementUsageMeter>>;

/** The entitlement result LOCKED_FEATURE_STATE renders. Never capped or dismissed; never redirect automatically. */
export interface FeatureCapability {
  key: LockableFeature;
  name: string;
  allowed: boolean;
  reason: string | null;
  /** Billing viewers only. */
  upgrade: { minimumPlan: string; recommendedPlan: string } | null;
  /** `primaryCTA` is null for a viewer who is not a billing viewer. */
  nudge: { title: string; body: string; primaryCTA: CtaAction | null } | null;
}

export interface EngagementContext {
  status: 'ok' | 'degraded';
  degraded: DegradedPart[];
  generatedAt: string;
  subscription: EngagementSubscription | null;
  usage: EngagementUsage;
  /** Ranked by the backend. Never re-rank. */
  prominent: Nudge | null;
  secondary: Nudge[];
  /** At most one of `banner` and `dashboardCard` is set, and it is `prominent` or one of `secondary`. */
  banner: Nudge | null;
  dashboardCard: Nudge | null;
  /** For the employer panel's badge, use `total` (contract §7.9). */
  unreadCounts: { total: number; byCategory: Record<NotificationCategory, number> } | null;
  capabilities: {
    features: Partial<Record<LockableFeature, FeatureCapability>>;
    flags: Record<CapabilityFlag, boolean>;
  };
}

/** GET /api/subscriptions/engagement/context (contract §3.1, §4.1). */
export interface EngagementContextResponse {
  success: true;
  context: EngagementContext;
}

/** One subscription or billing message (contract §4.3). */
export interface NotificationItem {
  /** `NOTIF-…` for engine messages, `SUBN-…` for payment notices. */
  id: string;
  category: 'SUBSCRIPTION' | 'BILLING';
  type: string;
  priority: EngagementPriority | null;
  surface: EngagementSurface;
  title: string;
  body: string;
  cta: { primary: CtaAction | null; secondary: CtaAction | null };
  /** Display hints only. Never parse commercial meaning from it. */
  metadata: Record<string, unknown>;
  status: NotificationStatus;
  isRead: boolean;
  /** false for CRITICAL and for every `SUBN-` notice. */
  dismissible: boolean;
  createdAt: string;
  readAt: string | null;
  clickedAt: string | null;
  expiresAt: string | null;
}

/** GET /api/subscriptions/notifications (contract §3.2). */
export interface NotificationListResponse {
  success: true;
  notifications: NotificationItem[];
  /** Unread, both categories, all pages; the filters do not change it. */
  unreadCount: number;
  unreadByCategory: { SUBSCRIPTION: number; BILLING: number };
  page: number;
  limit: number;
  hasMore: boolean;
  /** true when one store could not be read; the list and counts then cover the other. */
  degraded: boolean;
}

/** The list's query (contract §3.2). An omitted field takes the backend's default. */
export interface NotificationListQuery {
  status?: NotificationListStatus;
  category?: Array<'SUBSCRIPTION' | 'BILLING'>;
  priority?: EngagementPriority[];
  /** 1 to 50. */
  page?: number;
  /** 1 to 50. */
  limit?: number;
}

/** Read, dismiss and click (contract §4.4). */
export interface MessageActionResponse {
  success: true;
  found: true;
  status: NotificationStatus;
}

/** Nothing this viewer could have seen matched. A 200, and an answer rather than a failure. */
export interface MessageActionNotFound {
  success: true;
  found: false;
}

export type MessageActionResult = MessageActionResponse | MessageActionNotFound;

export interface MessageActionError {
  success: false;
  code: EngagementErrorCode;
  message: string;
}

export interface ListQueryError {
  success: false;
  code: 'INVALID_QUERY';
  field: string;
  message: string;
}

/** A header-bell row after E2 (contract §3.6, §4.5): additive to what the bell already reads. */
export interface BellNotification extends AppNotification {
  category: NotificationCategory;
  priority: EngagementPriority | null;
  cta: { primary: CtaAction | null; secondary: CtaAction | null } | null;
  dismissible: boolean;
  expiresAt: string | null;
}

/** GET /api/notifications (contract §4.5): the bell keeps its `{status, data}` envelope. */
export interface BellListResponse {
  status: 'success';
  data: {
    notifications: BellNotification[];
    unreadCount: number;
    unreadByCategory: Record<NotificationCategory, number>;
  };
}
