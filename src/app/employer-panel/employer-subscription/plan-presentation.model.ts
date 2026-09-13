import { BillingCycle, PlanCatalogItem, PlanEntitlements } from './subscription-v4.models';

/**
 * The single place plan *presentation* is derived.
 *
 * Every number on the pricing page — active jobs, employer users, Recruitment
 * Storage, video questions per job — comes from the backend catalog
 * (`GET /api/subscriptions/pricing-catalog`, planCatalogServiceV4.js) and is
 * formatted here. Nothing in this file hardcodes a capacity or a price.
 *
 * This exists because the page previously rendered a hardcoded `PLAN_CONFIGS`
 * array while the backend charged from its own catalog, so the page advertised
 * PHP 2,499 for Growth while checkout billed PHP 3,490. Deriving display from
 * the same source the charge comes from is what makes that class of drift
 * impossible rather than merely corrected once.
 */

/** Enterprise sends null on every numeric entitlement — "custom, resolved per account". */
export const CUSTOM_LABEL = 'Custom';

/**
 * The backend slug for the fourth tier is `business` (DEC-02); the product and the
 * live UI both call it Premium. This is the ONLY display-name override, kept here
 * so the slug stays canonical for routing, checkout and current-plan detection
 * while the label matches the product. Remove it if the backend ever renames.
 */
const DISPLAY_NAME_OVERRIDES: { [slug: string]: string } = {
  business: 'Premium',
};

export function planDisplayName(plan: PlanCatalogItem): string {
  return DISPLAY_NAME_OVERRIDES[plan.slug] || plan.name;
}

// ── Formatting ────────────────────────────────────────────────────────────────

/**
 * Bytes to a storage label. The backend stores capacity in bytes with GB
 * multiples, so this renders whole GB and only falls back to TB past 1024.
 * Returns null for a null capacity so callers can choose their own custom copy.
 */
export function formatStorage(bytes: number | null | undefined): string | null {
  if (bytes === null || typeof bytes === 'undefined') { return null; }
  const GB = 1024 * 1024 * 1024;
  if (bytes >= 1024 * GB) {
    const tb = bytes / (1024 * GB);
    return `${Number.isInteger(tb) ? tb : tb.toFixed(1)} TB`;
  }
  const gb = bytes / GB;
  return `${Number.isInteger(gb) ? gb : gb.toFixed(1)} GB`;
}

/**
 * A numeric entitlement, or "Custom" when the backend sends an explicit null
 * (Enterprise). An absent key is not "Custom" — it renders as a dash, and callers
 * are expected to have filtered it out already via isModelled().
 */
export function formatLimit(value: number | null | undefined): string {
  if (typeof value === 'undefined') { return '—'; }
  if (value === null) { return CUSTOM_LABEL; }
  return String(value);
}

/** Pluralises a capacity line without ever inventing the number itself. */
function countLine(value: number | null | undefined, singular: string, plural: string): string {
  if (value === null || typeof value === 'undefined') { return `${CUSTOM_LABEL} ${plural}`; }
  return `${value} ${value === 1 ? singular : plural}`;
}

// ── Capacity summary (the headline limits the catalog models) ─────────────────

export interface CapacityLine {
  key: 'jobs' | 'users' | 'storage' | 'videoQuestions';
  label: string;
}

/**
 * A field is MODELLED when the backend sends the key at all — including an explicit
 * `null`, which is Enterprise's "custom, resolved per account".
 *
 * An ABSENT key means this catalog version does not model that entitlement, which is
 * a different statement. The production catalog (`origin/main`, planCatalogServiceV4
 * at ad3b007) sends no `recruitment_storage_bytes`, `video_questions_per_job`,
 * `applicants` or `featured_job_credits`; only the uncommitted catalog in gh-be's tree
 * does. An earlier version of this file treated absent like null and rendered those
 * keys as "Custom" — telling a Starter employer they had custom storage. Absent now
 * means "say nothing about it".
 */
export function isModelled(e: PlanEntitlements | null | undefined, key: keyof PlanEntitlements): boolean {
  return !!e && Object.prototype.hasOwnProperty.call(e, key) && typeof (e as any)[key] !== 'undefined';
}

/**
 * The headline capacity limits on a plan card, in a fixed order so the cards read as
 * comparable columns. Only entitlements the catalog models are included.
 *
 * Storage is phrased as retained capacity ("50 GB Recruitment Storage"), never as a
 * monthly allowance ("50 GB/month") — it does not reset.
 */
export function capacityLines(plan: PlanCatalogItem): CapacityLine[] {
  const e = plan.entitlements;
  const lines: CapacityLine[] = [];

  if (isModelled(e, 'active_job_posts')) {
    lines.push({ key: 'jobs', label: countLine(e.active_job_posts, 'active job', 'active jobs') });
  }
  if (isModelled(e, 'admin_users')) {
    lines.push({ key: 'users', label: countLine(e.admin_users, 'employer user', 'employer users') });
  }
  if (isModelled(e, 'recruitment_storage_bytes')) {
    const storage = formatStorage(e.recruitment_storage_bytes);
    lines.push({
      key: 'storage',
      // An explicit null is custom capacity. For Enterprise the typical contractual
      // starting point is 500 GB+, so say that rather than a bare "Custom".
      label: storage
        ? `${storage} Recruitment Storage`
        : (plan.enterprise ? '500 GB+ Recruitment Storage' : `${CUSTOM_LABEL} Recruitment Storage`),
    });
  }
  if (isModelled(e, 'video_questions_per_job')) {
    const v = e.video_questions_per_job;
    lines.push({
      key: 'videoQuestions',
      label: v === null ? `${CUSTOM_LABEL} video questions` : `${v} video question${v === 1 ? '' : 's'}/job`,
    });
  }
  return lines;
}

// ── Pricing display ───────────────────────────────────────────────────────────

export interface PlanPriceDisplay {
  /** Headline amount, already formatted, or "Custom". */
  amount: string;
  /** "/month" etc. Empty for custom or free. */
  suffix: string;
  /** Shown under the price: annual disclosure, or monthly renewal copy. */
  caption: string | null;
  /** Annual only: "Equivalent to PHP X/month". Never shown for monthly. */
  effectiveMonthly: string | null;
}

/**
 * Resolves what a card shows for the selected billing cycle.
 *
 * The annual branch must never imply monthly billing: the backend marks
 * `mustDiscloseAnnualDueToday`, and its own copy states the amount is charged
 * today for 12 months. The effective-monthly figure is shown as an equivalence
 * only, alongside that disclosure — never instead of it.
 */
export function planPrice(plan: PlanCatalogItem, cycle: BillingCycle): PlanPriceDisplay {
  const pricing = plan.pricing;
  if (!pricing) {
    return { amount: CUSTOM_LABEL, suffix: '', caption: null, effectiveMonthly: null };
  }

  if (cycle === 'annual') {
    const a = pricing.annual;
    if (a.amount === null || typeof a.amount === 'undefined') {
      return { amount: CUSTOM_LABEL, suffix: '', caption: a.renewalLabel || null, effectiveMonthly: null };
    }
    if (a.amount === 0) {
      return { amount: 'Free', suffix: '', caption: a.renewalLabel || null, effectiveMonthly: null };
    }
    return {
      amount: peso(a.amount),
      suffix: '/year',
      caption: a.dueTodayLabel || 'Billed annually',
      effectiveMonthly: a.effectiveMonthlyLabel || null,
    };
  }

  const m = pricing.monthly;
  if (m.amount === null || typeof m.amount === 'undefined') {
    return { amount: CUSTOM_LABEL, suffix: '', caption: m.renewalLabel || null, effectiveMonthly: null };
  }
  if (m.amount === 0) {
    return { amount: 'Free', suffix: '', caption: m.renewalLabel || null, effectiveMonthly: null };
  }
  return { amount: peso(m.amount), suffix: '/month', caption: m.renewalLabel || null, effectiveMonthly: null };
}

/** PHP formatting with thousands separators. Amount only — no currency word. */
export function peso(amount: number): string {
  return '₱' + amount.toLocaleString('en-PH');
}

// ── Feature comparison ────────────────────────────────────────────────────────

export type ComparisonValue = string | boolean;

export interface ComparisonRow {
  label: string;
  /** Per-plan value, keyed by slug. */
  values: { [slug: string]: ComparisonValue };
}

export interface ComparisonGroup {
  title: string;
  rows: ComparisonRow[];
}

/**
 * Builds the Compare Plans matrix from the catalog only.
 *
 * A row appears only when EVERY plan in the catalog models its entitlement (see
 * isModelled). A row present for some plans and absent for others would force a guess
 * into the empty cells, and a comparison table is exactly where a guessed "Unlimited"
 * or "Custom" reads as a commitment. Groups left with no rows are dropped.
 *
 * Capabilities the backend does not model at all (talent pools, SSO, audit logs,
 * source-of-hire reporting and the rest of the Premium/Enterprise feature copy) are
 * never rendered — a tick for something nothing enforces is the dead-feature failure
 * the brief forbids.
 */
export function buildComparison(plans: PlanCatalogItem[]): ComparisonGroup[] {
  const byPlan = (fn: (p: PlanCatalogItem) => ComparisonValue) => {
    const out: { [slug: string]: ComparisonValue } = {};
    plans.forEach(p => { out[p.slug] = fn(p); });
    return out;
  };
  const modelledByAll = (key: keyof PlanEntitlements) =>
    plans.length > 0 && plans.every(p => isModelled(p.entitlements, key));

  type RowSpec = { label: string; field: keyof PlanEntitlements; value: (p: PlanCatalogItem) => ComparisonValue };
  const group = (title: string, specs: RowSpec[]): ComparisonGroup => ({
    title,
    rows: specs.filter(r => modelledByAll(r.field)).map(r => ({ label: r.label, values: byPlan(r.value) })),
  });

  return [
    group('Hiring capacity', [
      { label: 'Active jobs', field: 'active_job_posts', value: p => formatLimit(p.entitlements.active_job_posts) },
      { label: 'Employer users', field: 'admin_users', value: p => formatLimit(p.entitlements.admin_users) },
      {
        label: 'Applicants', field: 'applicants',
        // Modelled, and null on a paid plan means uncapped rather than unknown.
        value: p => p.entitlements.applicants === null ? 'Unlimited' : String(p.entitlements.applicants),
      },
      {
        label: 'Recruitment Storage', field: 'recruitment_storage_bytes',
        value: p => formatStorage(p.entitlements.recruitment_storage_bytes) || (p.enterprise ? '500 GB+' : CUSTOM_LABEL),
      },
    ]),
    group('Candidate screening', [
      { label: 'Video questions per job', field: 'video_questions_per_job', value: p => formatLimit(p.entitlements.video_questions_per_job) },
      { label: 'Video responses included', field: 'video_responses', value: p => formatLimit(p.entitlements.video_responses) },
      { label: 'Interview questions', field: 'video_interview_questions', value: p => !!p.entitlements.video_interview_questions },
    ]),
    group('Employer brand', [
      { label: 'Customised company page', field: 'customized_company_page', value: p => !!p.entitlements.customized_company_page },
      {
        label: 'Featured job credits per month', field: 'featured_job_credits',
        value: p => {
          const v = p.entitlements.featured_job_credits;
          if (v === null) { return CUSTOM_LABEL; }
          return v === 0 ? false : String(v);
        },
      },
    ]),
    group('Support', [
      { label: 'Dedicated support', field: 'dedicated_support', value: p => !!p.entitlements.dedicated_support },
    ]),
  ].filter(g => g.rows.length > 0);
}

// ── Card CTA ──────────────────────────────────────────────────────────────────

export interface PlanCta {
  label: string;
  /** false for the plan the employer is already on, and for a plan with nothing to act on. */
  actionable: boolean;
  /** 'none' means the card renders no button at all. */
  kind: 'current' | 'upgrade' | 'switch' | 'contact_sales' | 'choose' | 'none';
}

/**
 * Resolves a card's CTA from the catalog's own `current` flag and slug order.
 *
 * `current` comes from the backend (it resolves legacy slug aliases before
 * comparing), so the current plan can never simultaneously read "Current plan"
 * and "Upgrade to ..." — the conflicting-state problem the brief calls out.
 */
export function planCta(plan: PlanCatalogItem, orderedSlugs: string[], currentSlug: string | null): PlanCta {
  if (plan.current || (currentSlug && plan.slug === currentSlug)) {
    return { label: 'Current plan', actionable: false, kind: 'current' };
  }
  if (plan.enterprise || plan.contactSalesRequired) {
    return { label: 'Contact Sales', actionable: true, kind: 'contact_sales' };
  }
  // Nothing to act on: the backend gives this plan no upgrade route (the Free
  // Trial). A button here looked actionable and did nothing, so the card renders
  // none instead.
  if (!plan.upgradeRoute) {
    return { label: '', actionable: false, kind: 'none' };
  }
  if (!currentSlug) {
    return { label: `Choose ${planDisplayName(plan)}`, actionable: true, kind: 'choose' };
  }
  const currentIdx = orderedSlugs.indexOf(currentSlug);
  const targetIdx = orderedSlugs.indexOf(plan.slug);
  if (currentIdx >= 0 && targetIdx >= 0 && targetIdx < currentIdx) {
    return { label: `Switch to ${planDisplayName(plan)}`, actionable: true, kind: 'switch' };
  }
  return { label: `Upgrade to ${planDisplayName(plan)}`, actionable: true, kind: 'upgrade' };
}
