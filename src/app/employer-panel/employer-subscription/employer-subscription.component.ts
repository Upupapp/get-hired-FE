import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { CompanyFacade } from '@main/company/state/company.facade';
import { SubscriptionSummaryService } from './subscription-summary.service';
import { EmployerSubscriptionSummary, EntitlementUsage, BooleanEntitlement, InvoiceListItem } from './subscription.models';
import { BillingService } from './services/billing.service';
import { InvoiceSendModalComponent } from './components/invoice-send-modal/invoice-send-modal.component';
import { SubscriptionPricingCatalogService } from './services/subscription-pricing-catalog.service';
import { SubscriptionGuardrailService } from './services/subscription-guardrail.service';
import { StorageAddonCheckoutRequest } from './services/subscription-checkout-intent.service';
import { BillingCycle, PlanCatalogItem, PlanEntitlements, PricingCatalog, RecruitmentStorageUsageV4 } from './subscription-v4.models';
import { APPROVED_PRICING_CATALOG } from './approved-pricing-catalog';
import {
  CapacityLine,
  ComparisonGroup,
  PlanCta,
  PlanPriceDisplay,
  buildComparison,
  capacityLines,
  isModelled,
  planCta,
  planDisplayName,
  planPrice,
  formatStorage,
} from './plan-presentation.model';

/**
 * The address every support mailto on this page opens, and the one the FAQ quotes,
 * so the page can never name two different addresses.
 */
const SUPPORT_EMAIL = 'support@gethired.ph';

/**
 * A hero or banner button: what it says and what it does. Every kind has a real
 * destination, so a status with nothing to act on gets no button rather than a
 * reload labelled as one.
 */
export interface LifecycleAction {
  label: string;
  kind: 'upgrade' | 'reactivate' | 'compare' | 'plans' | 'contact_billing';
}

// Shared instances: heroAction and bannerAction are read on every change detection,
// and a fresh object each time would fail Angular's dev-mode check on `*ngIf="… as action"`.
const CHOOSE_PLAN: LifecycleAction = { label: 'Choose a plan', kind: 'upgrade' };
const UPGRADE_NOW: LifecycleAction = { label: 'Upgrade now', kind: 'upgrade' };
const CONTACT_BILLING: LifecycleAction = { label: 'Contact billing support', kind: 'contact_billing' };
const REACTIVATE_PLAN: LifecycleAction = { label: 'Reactivate plan', kind: 'reactivate' };
const CHANGE_PLAN: LifecycleAction = { label: 'Change plan', kind: 'plans' };
const COMPARE_PLANS: LifecycleAction = { label: 'Compare plans', kind: 'compare' };

@Component({
  selector: 'app-employer-subscription',
  templateUrl: './employer-subscription.component.html',
  styleUrls: ['./employer-subscription.component.scss'],
  animations: [mainAnimations],
})
export class EmployerSubscriptionComponent implements OnInit, OnDestroy, AfterViewInit {
  private destroy$ = new Subject<void>();

  loading = true;
  loadError = false;
  summary: EmployerSubscriptionSummary | null = null;
  companyDetails: any = null;

  // ── Subscription subtab state ───────────────────────────────────────────────
  activeTab: 'plan' | 'invoices' | 'billing-profile' = 'plan';

  // ── Invoice Vault state ─────────────────────────────────────────────────────
  invoices: InvoiceListItem[] = [];
  invoicesLoading = false;
  invoicesError: string | null = null;
  invoicesTotal = 0;
  selectedInvoiceId: string | null = null;
  invoiceFallbackMode = false;

  // FAQ accordion state. Keyed by question text, not index: the visible FAQ list is filtered by what the
  // catalog models (see visibleFaqItems), so an index would point at a different
  // question whenever the catalog changes shape.
  private openFaqs = new Set<string>();

  readonly faqItems: Array<{ q: string; a: string; requires?: keyof PlanEntitlements }> = [
    {
      q: 'What is Recruitment Storage?',
      requires: 'recruitment_storage_bytes',
      a: 'Recruitment Storage is the capacity included with your plan for applicant video responses, CVs and resumes, uploaded candidate documents, portfolio files and other candidate media held in GetHired.'
    },
    {
      q: 'Does Recruitment Storage reset every month?',
      requires: 'recruitment_storage_bytes',
      a: 'No. Recruitment Storage is the total active capacity included with your plan, not a monthly allowance. It reflects what you are currently holding, so it only goes down when you remove candidate media.'
    },
    {
      q: 'What happens if I reach my storage limit?',
      requires: 'recruitment_storage_bytes',
      a: 'New applications, video responses and files still reach you, and nothing already submitted is deleted. Your usage is simply over your plan\'s capacity, so choose a plan with more Recruitment Storage to bring it back within it.'
    },
    {
      q: 'Can I delete old applications or media to free storage?',
      requires: 'recruitment_storage_bytes',
      a: 'Yes, subject to the platform\'s retention and deletion rules.'
    },
    {
      q: 'What happens when my free trial ends?',
      // B6: from gh-be's committed code (7613c06): nothing unpublishes or hides a published job when a
      // trial ends; plan limits gate only new actions (A3/A3.1). Say nothing it does not enforce.
      // B6.1: whether applications keep arriving after a trial ends is unconfirmed, so it is not said.
      a: 'Your published jobs stay published. Choose a plan to publish or reopen jobs, add team members, or add screening questions.'
    },
    {
      q: 'What counts as an active job post?',
      a: 'An active job post is any published job listing that is currently visible to applicants on GetHired. Drafts and closed positions do not count toward your limit.'
    },
    {
      q: 'Can I change plans later?',
      a: 'Yes. You can upgrade or switch plans at any time. When upgrading, the new plan takes effect immediately. When switching to a lower tier, the change takes effect at the end of your current billing period.'
    },
    {
      q: 'How does annual billing work?',
      a: 'Annual plans are charged once for twelve months of access rather than billed monthly. The exact amount due today, and the equivalent monthly figure, are both shown on each plan card when Annual is selected.'
    },
    {
      q: 'How many video questions can I ask per job?',
      requires: 'video_questions_per_job',
      a: 'GetHired Video Screening lets you ask applicants structured questions and review their recorded answers alongside their CV. The number of questions available per job depends on your plan and is shown on each plan card and in Compare plans.'
    },
    {
      q: 'What payment methods are accepted?',
      a: 'GetHired accepts major credit and debit cards, GCash, and other payment methods available through PayMongo. Enterprise plans may be invoiced manually.'
    },
    {
      q: 'How do I fix a failed payment?',
      a: `If a payment fails, this page shows a "Contact billing support" button. It opens an email to ${SUPPORT_EMAIL}, and our billing team will help you complete the payment. Your plan will remain active for a short grace period while you resolve the issue.`
    },
    {
      q: 'Who do I contact for billing help?',
      a: `For billing questions, reach out to our support team at ${SUPPORT_EMAIL}. Enterprise customers have a dedicated account manager.`
    },
  ];


  // ── Backend pricing catalog ─────────────────────────────────────────────────
  // Every price, capacity and Recruitment Storage figure rendered on this page
  // comes from here. Nothing about plan content is decided in the frontend.
  catalog: PricingCatalog | null = null;
  catalogLoading = true;
  catalogError = false;

  /**
   * Recruitment Storage usage: the V4 employer summary's `usage.recruitment_storage` block,
   * passed to the meter unchanged. Null renders no meter, both when that request fails and
   * when the backend predates the block and sends no key (absent is not zero).
   */
  storageUsage: RecruitmentStorageUsageV4 | null = null;
  storageCheckoutCode: StorageAddonCheckoutRequest['packageCode'] | null = null;
  storageCheckoutError: string | null = null;

  /** Selected billing cycle for the pricing cards. Seeded from the catalog. */
  billingCycle: BillingCycle = 'monthly';

  // Recruitment Storage: the plan's CAPACITY comes from the catalog, and the cards, Compare
  // plans and the storage FAQ show it only when the catalog models it (isModelled). How much
  // an employer has CONSUMED comes from the V4 employer summary's usage.recruitment_storage
  // block (storageUsage below), which also carries the 70/80/90/100% band as storageStatus,
  // so no threshold is derived here. The per-category breakdown is not built: no endpoint
  // serves it.

  constructor(
    public companyFacade: CompanyFacade,
    private subscriptionSummaryService: SubscriptionSummaryService,
    private router: Router,
    private dialog: MatDialog,
    private billing: BillingService,
    private pricingCatalogService: SubscriptionPricingCatalogService,
    private guardrailService: SubscriptionGuardrailService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    // Read company data without dispatching clearing actions
    this.companyFacade.companyDetails$
      .pipe(takeUntil(this.destroy$))
      .subscribe(details => {
        this.companyDetails = details;
      });

    // The upgrade landing's "Compare all plans" opens this page as ?compare=1.
    this.compareRequested = this.route.snapshot.queryParamMap.get('compare') === '1';
    const requestedTab = this.route.snapshot.queryParamMap.get('tab');
    if (requestedTab === 'billing-profile' || requestedTab === 'invoices') { this.switchTab(requestedTab); }
    this.loadSummary();
  }

  // ── Available Plans carousel ────────────────────────────────────────────────
  // Presentational-only: auto-advances one CARD every 2s, pauses on
  // hover/touch/manual interaction, and never touches plan data, CTA
  // handlers, or current-plan/recommended detection below.
  //
  // Back to one dot per plan card (per explicit feedback) -- the page-based
  // dot count from the prior pass was technically "correct" but didn't
  // match what people expect a pricing carousel's dots to mean ("this dot
  // is the Growth plan"). What's fixed now that wasn't before: dot-click
  // reliably scrolls the EXACT clicked card fully into view (measured via
  // the card's real offsetLeft, not a page-width guess), and the active
  // dot is kept in sync the same way, so it can never disagree with what's
  // actually on screen. This is only possible now because the real bugs
  // that made per-card tracking flaky are already fixed elsewhere in this
  // file: the recommended card's transform:scale() visual overlap, and
  // mobile's partial-next-card peek.
  @ViewChild('planCarouselTrack') planCarouselTrack?: ElementRef<HTMLElement>;

  planCarouselActiveIndex = 0;
  /** Edge affordance visibility -- the fade/gradient hints are only shown
   *  where there's genuinely more content in that direction, never as a
   *  static decoration that implies clipping when there's nothing to
   *  scroll to. */
  planCarouselCanScrollPrev = false;
  planCarouselCanScrollNext = false;

  private planCarouselTimer: any;
  private planCarouselResumeTimer: any;
  private planCarouselPaused = false;
  /** Set only by the explicit pause control. Kept separate from the transient
   *  hover/touch/focus pause, so an interaction ending can never silently undo a
   *  pause the Employer asked for. */
  planCarouselUserPaused = false;
  private planCarouselResizeObserver?: ResizeObserver;
  private planCarouselResizeDebounce: any;

  ngAfterViewInit(): void {
    // Let layout settle (card widths via clamp()) before the first measure.
    setTimeout(() => this.syncScrollBoundaryState(), 0);

    // A plain window:resize listener only fires on actual viewport
    // resize -- it misses font-load reflow, a sidebar/drawer toggling
    // elsewhere on the page, browser zoom, or the track's own content
    // changing width for any other reason. ResizeObserver watches the
    // track element itself, so any of those cases refresh edge-affordance
    // state too. Debounced so a drag-resize doesn't thrash.
    this.observePlanCarouselTrack();

    this.startPlanCarouselAutoScroll();
  }

  /**
   * Attaches the resize watch at most once. The track renders only after the catalog has
   * loaded, which is usually after this view initialises, so the catalog callback calls
   * this too; before that, ngAfterViewInit found no track and nothing was watched.
   */
  private observePlanCarouselTrack(): void {
    if (this.planCarouselResizeObserver || typeof ResizeObserver === 'undefined' || !this.planCarouselTrack?.nativeElement) { return; }
    this.planCarouselResizeObserver = new ResizeObserver(() => {
      clearTimeout(this.planCarouselResizeDebounce);
      this.planCarouselResizeDebounce = setTimeout(() => this.syncScrollBoundaryState(), 120);
    });
    this.planCarouselResizeObserver.observe(this.planCarouselTrack.nativeElement);
  }

  private startPlanCarouselAutoScroll(): void {
    if (typeof window === 'undefined') { return; }
    // Never auto-move content for users who've asked for reduced motion --
    // manual dot/arrow navigation still works either way.
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { return; }

    this.planCarouselTimer = setInterval(() => {
      if (this.planCarouselPaused || this.planCarouselUserPaused) { return; }
      this.advancePlanCarousel();
    }, 2000);
  }

  private getPlanCarouselCards(): HTMLElement[] {
    const track = this.planCarouselTrack?.nativeElement;
    return track ? (Array.from(track.children) as HTMLElement[]) : [];
  }

  advancePlanCarousel(): void {
    const cards = this.getPlanCarouselCards();
    if (cards.length === 0) { return; }
    const next = (this.planCarouselActiveIndex + 1) % cards.length;
    this.scrollToCard(next);
  }

  /** THE FIX: scrolls so the exact card at `index` is fully visible at the
   *  start of the viewport, using that card's real offsetLeft rather than
   *  a page-width multiple -- this is what makes "click dot 3, see plan 3"
   *  actually reliable regardless of how many cards fit per view. Clamped
   *  by the browser's own scrollTo bounds, so the last card's target
   *  (which may overshoot scrollWidth) simply settles at the true end. */
  scrollToCard(index: number): void {
    const track = this.planCarouselTrack?.nativeElement;
    const cards = this.getPlanCarouselCards();
    const target = cards[index];
    if (!track || !target) { return; }
    this.planCarouselActiveIndex = index;
    track.scrollTo({ left: target.offsetLeft - track.offsetLeft, behavior: 'smooth' });
  }

  /** Manual dot/arrow click: jump to that plan card and pause auto-advance
   *  briefly so the carousel doesn't yank focus away right after someone
   *  picks one. */
  goToPlanSlide(index: number): void {
    this.scrollToCard(index);
    this.planCarouselPaused = true;
    clearTimeout(this.planCarouselResumeTimer);
    this.planCarouselResumeTimer = setTimeout(() => { this.planCarouselPaused = false; }, 5000);
  }

  onPlanCarouselInteractionStart(): void {
    this.planCarouselPaused = true;
  }

  onPlanCarouselInteractionEnd(): void {
    clearTimeout(this.planCarouselResumeTimer);
    this.planCarouselResumeTimer = setTimeout(() => { this.planCarouselPaused = false; }, 3000);
  }

  /** Whether the carousel moves on its own at all. Reduced-motion users get no
   *  auto-advance (see startPlanCarouselAutoScroll), so they get no control for
   *  movement that is not happening. A getter rather than state set in
   *  ngAfterViewInit, which would change a bound value mid change detection. */
  get planCarouselMotionAllowed(): boolean {
    if (typeof window === 'undefined') { return false; }
    return !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  /**
   * The track overflows, so auto-advance really moves it. Cards keep a fixed width at every
   * breakpoint, so this can be true on a desktop as well as a phone; the pause control
   * follows it rather than the ≤768px dots.
   */
  get planCarouselCanMove(): boolean {
    return this.planCarouselCanScrollPrev || this.planCarouselCanScrollNext;
  }

  /** WCAG 2.2.2: content that moves automatically for more than five seconds
   *  needs a way to pause it. Hover, touch and focus already pause briefly;
   *  this is the persistent, explicit control. */
  togglePlanCarouselAutoAdvance(): void {
    this.planCarouselUserPaused = !this.planCarouselUserPaused;
  }

  /** Keeps the active dot + edge affordances in sync when the Employer
   *  manually swipes/drags/scrolls the track (mouse or touch) -- finds
   *  whichever card's left edge is genuinely closest to the current
   *  scroll position, so the active dot always matches what's actually
   *  pinned at the start of the viewport. */
  syncActiveSlide(): void {
    const track = this.planCarouselTrack?.nativeElement;
    const cards = this.getPlanCarouselCards();
    if (!track || cards.length === 0) { return; }

    let closest = 0;
    let closestDist = Infinity;
    cards.forEach((card, i) => {
      const dist = Math.abs((card.offsetLeft - track.offsetLeft) - track.scrollLeft);
      if (dist < closestDist) { closestDist = dist; closest = i; }
    });
    this.planCarouselActiveIndex = closest;

    this.syncScrollBoundaryState();
  }

  /** Whether there's genuinely more content to the left/right of the
   *  current scroll position -- drives the edge-fade visibility. A 1px
   *  tolerance absorbs sub-pixel scroll-position rounding across
   *  browsers. */
  private syncScrollBoundaryState(): void {
    const track = this.planCarouselTrack?.nativeElement;
    if (!track) { return; }
    this.planCarouselCanScrollPrev = track.scrollLeft > 1;
    this.planCarouselCanScrollNext = track.scrollLeft < track.scrollWidth - track.clientWidth - 1;
  }

  loadSummary(): void {
    this.loading = true;
    this.loadError = false;

    this.subscriptionSummaryService.getSummary()
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.summary = data;
          this.loading = false;
          this.focusRequestedSection();
        },
        (_err) => {
          this.loadError = true;
          this.loading = false;
          this.focusRequestedSection();
        }
      );

    this.loadPricingCatalog();
    this.loadStorageUsage();
  }

  /**
   * Loads Recruitment Storage usage from its own request, so a backend without the block,
   * or a failure here, never blanks the summary or the price list.
   */
  loadStorageUsage(): void {
    this.guardrailService.getSummary()
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res) => {
          const usage = res && res.summary && res.summary.usage;
          const block = usage && usage.recruitment_storage;
          this.storageUsage = block && typeof block.used === 'number' ? block : null;
        },
        (_err) => {
          this.storageUsage = null;
        }
      );
  }

  /**
   * Loads the backend pricing catalog — the source of truth for every price,
   * capacity and Recruitment Storage figure on this page.
   *
   * Kept independent of the summary request on purpose: the summary is the
   * employer's own usage, the catalog is the price list. If usage fails to load
   * the employer should still be able to read the plans, and vice versa, so
   * neither failure is allowed to blank the other half of the page.
   */
  loadPricingCatalog(): void {
    this.catalogLoading = true;
    this.catalogError = false;

    this.pricingCatalogService.getCatalog()
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res) => {
          this.catalog = (res && res.catalog) ? res.catalog : null;
          if (this.catalog && this.catalog.upgradeLandingDefaultCycle) {
            this.billingCycle = this.catalog.upgradeLandingDefaultCycle;
          }
          this.catalogLoading = false;
          this.focusRequestedSection();
          // The track renders on the change detection after this callback: measure it then,
          // so the edge fades and the pause control reflect whether it can scroll.
          setTimeout(() => {
            if (this.destroy$.isStopped) { return; }
            this.observePlanCarouselTrack();
            this.syncScrollBoundaryState();
          }, 0);
        },
        (_err) => {
          // No local price fallback by design. Showing a stale hardcoded figure
          // is what produced the advertise-one-price / charge-another mismatch this
          // page is being fixed for; an honest empty state is safer than a
          // confident wrong number.
          this.catalog = null;
          this.catalogError = true;
          this.catalogLoading = false;
          this.focusRequestedSection();
        }
      );
  }

  // --- Entitlement formatting helpers ---

  formatEntitlement(usage: EntitlementUsage): string {
    if (!usage) { return '—'; }
    if (usage.included === 'unlimited') {
      return usage.used + ' / Unlimited';
    }
    if (usage.included === null || usage.included === undefined) {
      return String(usage.used);
    }
    return usage.used + ' of ' + usage.included + ' used';
  }

  formatEntitlementMax(usage: EntitlementUsage): string {
    if (!usage) { return '—'; }
    if (usage.included === 'unlimited') { return 'Unlimited'; }
    if (usage.included === null || usage.included === undefined) { return '—'; }
    return String(usage.included);
  }

  formatBooleanEntitlement(ent: BooleanEntitlement): string {
    if (!ent) { return 'Not included'; }
    return ent.included ? 'Included' : 'Not included';
  }

  isNearLimit(usage: EntitlementUsage): boolean {
    if (!usage) { return false; }
    if (usage.included === 'unlimited' || usage.included === null || usage.included === 0) {
      return false;
    }
    return (usage.used / (usage.included as number)) >= 0.8;
  }

  isAtLimit(usage: EntitlementUsage): boolean {
    if (!usage) { return false; }
    if (usage.included === 'unlimited' || usage.included === null || usage.included === 0) {
      return false;
    }
    return usage.used >= (usage.included as number);
  }

  getMeterPercent(usage: EntitlementUsage): number {
    if (!usage) { return 0; }
    if (usage.included === 'unlimited' || !usage.included || (usage.included as number) === 0) {
      return 0;
    }
    const pct = (usage.used / (usage.included as number)) * 100;
    return Math.min(pct, 100);
  }

  getMeterClass(usage: EntitlementUsage): string {
    if (this.isAtLimit(usage)) { return 'gh-usage-meter-fill--danger'; }
    if (this.isNearLimit(usage)) { return 'gh-usage-meter-fill--warning'; }
    return '';
  }

  isUnlimited(usage: EntitlementUsage): boolean {
    return usage && usage.included === 'unlimited';
  }

  // When video_response DB column is boolean, included=null but booleanIncluded is set.
  videoResponsesIsBoolean(usage: any): boolean {
    return usage && usage.included === null && typeof usage.booleanIncluded === 'boolean';
  }

  videoResponsesBooleanIncluded(usage: any): boolean {
    return usage && usage.booleanIncluded === true;
  }

  get recommendedPlan() {
    return this.summary && this.summary.recommendedPlan;
  }


  // --- Upgrade routing (annual-first) ---

  navigateToUpgrade(planCode: string): void {
    if (this.isCurrentPlan(planCode)) return;
    const order = ['free_trial', 'starter', 'growth', 'business', 'enterprise'];
    // Remap legacy 'premium' alias used in PLAN_CONFIGS
    const normalizedCode = planCode === 'premium' ? 'business' : planCode;
    if (normalizedCode === 'enterprise') { return; }
    this.router.navigate(['/recruiter/subscription/upgrade', normalizedCode]);
  }

  // --- Plan helpers ---


  isCurrentPlan(planCode: string): boolean {
    const current = this.summary && this.summary.currentPlan && this.summary.currentPlan.code;
    return current === planCode;
  }

  isCurrentPlanAboveOrEqualTo(planCode: string): boolean {
    const current = this.summary && this.summary.currentPlan && this.summary.currentPlan.code;
    if (!current || current === 'none' || current === null) { return false; }
    const order = ['free_trial', 'starter', 'growth', 'premium', 'enterprise'];
    const currentIdx = order.indexOf(current);
    const targetIdx = order.indexOf(planCode);
    if (currentIdx < 0 || targetIdx < 0) { return current === planCode; }
    return currentIdx >= targetIdx;
  }

  // ── Catalog-driven plan rendering ───────────────────────────────────────────
  //
  // This replaced getEffectivePlanConfigs(), which branched on whether the
  // backend had returned plans and then returned the hardcoded PLAN_CONFIGS
  // either way — a dead branch that silently guaranteed the frontend's own
  // prices always won. That is how the page came to advertise one price for
  // Growth while planCatalogServiceV4 charged another.

  /** Plans to render, straight from the backend catalog. Empty until it loads. */
  get catalogPlans(): PlanCatalogItem[] {
    if (this.catalog && this.catalog.plans) { return this.catalog.plans; }

    // Older production runtimes return the employer-specific catalog with the
    // subscription summary. It remains server data (including price and CTA),
    // so use it when the dedicated catalog endpoint is not available rather
    // than replacing it with frontend constants or leaving the dashboard empty.
    const plans = this.summary && this.summary.availablePlans;
    const summaryPlans = (plans || []).map(plan => {
      const slug = plan.code === 'premium' ? 'business' : plan.code;
      const feature = (key: string) => !!(plan.features || []).find(item => item.key === key && item.included);
      const monthly = typeof plan.priceMonthly === 'number' ? plan.priceMonthly : null;
      return {
        slug,
        name: plan.name,
        audience: plan.audience || plan.description || '',
        recommended: !!plan.recommended,
        trial: !!plan.trial,
        enterprise: !!plan.enterprise,
        current: !!plan.current || this.isCurrentPlan(plan.code),
        pricing: {
          monthly: {
            amount: monthly as any,
            currency: plan.currency || 'PHP',
            label: monthly === null ? 'Custom' : String(monthly),
            renewalLabel: monthly && monthly > 0 ? 'Paid monthly' : '',
          },
          annual: {
            amount: null as any,
            currency: plan.currency || 'PHP',
            dueTodayLabel: '',
            effectiveMonthlyLabel: '',
            savingsCopy: null,
            annualSavingsAmount: 0,
            renewalLabel: '',
          },
        },
        entitlements: {
          active_job_posts: this.summaryLimit(plan.limits ? plan.limits.activeJobs : undefined),
          admin_users: this.summaryLimit(plan.limits ? plan.limits.adminUsers : undefined),
          video_responses: this.summaryLimit(plan.limits ? plan.limits.videoResponses : undefined),
          customized_company_page: feature('customized_company_page') || feature('company_page'),
          video_interview_questions: feature('video_interview_questions') || feature('video_questions'),
          dedicated_support: feature('dedicated_support'),
        },
        upgradeRoute: plan.enterprise || plan.ctaAction === 'current' ? null : `/recruiter/subscription/upgrade/${slug}`,
        contactSalesRequired: !!plan.enterprise || plan.ctaAction === 'contact_sales',
        defaultBillingCycle: 'monthly' as BillingCycle,
      } as PlanCatalogItem;
    });

    // Merge partial employer records into the complete approved catalog. This
    // preserves current/recommended flags and any server-returned monthly price,
    // while ensuring older production runtimes do not hide unreturned tiers.
    const bySlug = new Map(summaryPlans.map(plan => [plan.slug, plan]));
    return APPROVED_PRICING_CATALOG.plans.map(approved => {
      const serverPlan = bySlug.get(approved.slug);
      const current = serverPlan
        ? serverPlan.current
        : this.currentPlanSlugFromSummary === approved.slug;
      if (!serverPlan) { return { ...approved, current }; }
      return {
        ...approved,
        ...serverPlan,
        current,
        pricing: {
          monthly: serverPlan.pricing.monthly,
          annual: approved.pricing.annual,
        },
        entitlements: {
          ...approved.entitlements,
          ...serverPlan.entitlements,
        },
      };
    });
  }

  private get currentPlanSlugFromSummary(): string | null {
    const code = this.summary && this.summary.currentPlan && this.summary.currentPlan.code;
    if (!code || code === 'none') { return null; }
    return code === 'premium' ? 'business' : code;
  }

  private summaryLimit(value: number | 'unlimited' | null | undefined): number | null {
    return value === 'unlimited' || typeof value === 'undefined' ? null : value;
  }

  /** Tier order, derived from catalog order rather than a second hardcoded list. */
  get orderedSlugs(): string[] {
    return this.catalogPlans.map(p => p.slug);
  }

  /**
   * The employer's current plan slug.
   *
   * Prefers the catalog's own `current` flag, because the backend resolves
   * legacy slug aliases (`premium` → `business`) before setting it. Falling back
   * to the summary's raw code is what made the old order arrays disagree:
   * navigateToUpgrade() remapped premium→business while getPlanCta() did not, so
   * the fourth tier ranked inconsistently depending on which method was asked.
   */
  get currentPlanSlug(): string | null {
    const flagged = this.catalogPlans.find(p => p.current);
    if (flagged) { return flagged.slug; }
    const code = this.summary && this.summary.currentPlan && this.summary.currentPlan.code;
    if (!code || code === 'none') { return null; }
    return code === 'premium' ? 'business' : code;
  }

  planName(plan: PlanCatalogItem): string {
    return planDisplayName(plan);
  }

  planCapacities(plan: PlanCatalogItem): CapacityLine[] {
    return capacityLines(plan);
  }

  planPriceFor(plan: PlanCatalogItem): PlanPriceDisplay {
    return planPrice(plan, this.billingCycle);
  }

  /** Catalog record used by the overview card. */
  get currentCatalogPlan(): PlanCatalogItem | null {
    return this.catalogPlans.find(plan => this.isCurrentCatalogPlan(plan)) || null;
  }

  /** Backend recommendation joined to the authoritative catalog record. */
  get recommendedCatalogPlan(): PlanCatalogItem | null {
    const code = this.recommendedPlan && this.recommendedPlan.planCode;
    const normalized = code === 'premium' ? 'business' : code;
    return this.catalogPlans.find(plan => plan.slug === normalized)
      || this.catalogPlans.find(plan => plan.recommended)
      || this.catalogPlans.find(plan => !plan.current && (plan.enterprise || !!plan.upgradeRoute))
      || null;
  }

  get trialDaysLeft(): number | null {
    const raw = this.summary && this.summary.currentPlan &&
      (this.summary.currentPlan.trialEndsAt || this.summary.currentPlan.currentPeriodEnd);
    if (!raw || (this.currentStatus !== 'trialing' && this.currentStatus !== 'trial_ending_soon')) { return null; }
    const remaining = new Date(raw).getTime() - Date.now();
    return Math.max(0, Math.ceil(remaining / 86400000));
  }

  get storageUsedLabel(): string {
    return this.storageUsage ? (formatStorage(this.storageUsage.used) || '0 GB') : '—';
  }

  get storageLimitLabel(): string {
    if (!this.storageUsage) { return '—'; }
    if (this.storageUsage.limit === 'unlimited' || this.storageUsage.limit === null) { return 'Custom'; }
    return formatStorage(this.storageUsage.limit) || '0 GB';
  }

  get storagePercent(): number | null {
    if (!this.storageUsage || typeof this.storageUsage.percentUsed !== 'number') { return null; }
    return Math.max(0, Math.min(100, Math.round(this.storageUsage.percentUsed)));
  }

  planFeatureLabels(plan: PlanCatalogItem): string[] {
    const labels = this.planCapacities(plan).map(item => item.label);
    const e = plan.entitlements;
    if (e.customized_company_page) { labels.push('Customized company page'); }
    if (e.video_interview_questions) { labels.push('Video interview questions'); }
    if (e.dedicated_support) { labels.push('Dedicated support'); }
    return labels;
  }

  startStorageCheckout(packageCode: StorageAddonCheckoutRequest['packageCode']): void {
    if (this.storageCheckoutCode) { return; }
    this.storageCheckoutCode = packageCode;
    this.storageCheckoutError = null;
    this.billing.createStorageAddonCheckout({ packageCode, billingCycle: 'monthly' })
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        response => {
          this.storageCheckoutCode = null;
          if (response && response.checkoutUrl && /^https:\/\//i.test(response.checkoutUrl)) {
            window.location.assign(response.checkoutUrl);
            return;
          }
          this.storageCheckoutError = 'Storage checkout is unavailable right now.';
        },
        () => {
          this.storageCheckoutCode = null;
          this.storageCheckoutError = 'Storage checkout is unavailable right now.';
        }
      );
  }

  ctaFor(plan: PlanCatalogItem): PlanCta {
    return planCta(plan, this.orderedSlugs, this.currentPlanSlug);
  }

  get comparisonGroups(): ComparisonGroup[] {
    return buildComparison(this.catalogPlans);
  }

  /** True when the backend offers both cycles, so the toggle is never a no-op. */
  get canToggleBillingCycle(): boolean {
    const source = this.catalog || APPROVED_PRICING_CATALOG;
    return !!(source.monthlyAvailable && source.annualAvailable);
  }

  setBillingCycle(cycle: BillingCycle): void {
    this.billingCycle = cycle;
  }

  /** Routes a card CTA. Enterprise never reaches self-serve checkout. */
  onPlanCta(plan: PlanCatalogItem): void {
    const cta = this.ctaFor(plan);
    if (!cta.actionable) { return; }
    if (cta.kind === 'contact_sales') {
      this.contactSales();
      return;
    }
    // planCta() only makes a card actionable when there is somewhere to go — a
    // plan with no upgradeRoute renders no button at all — so this guard satisfies
    // the type checker rather than being a silent no-op path.
    if (plan.upgradeRoute) {
      this.router.navigateByUrl(plan.upgradeRoute);
    }
  }

  contactSales(): void {
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=GetHired%20Enterprise%20enquiry`;
  }

  // ── Hero and banner lifecycle actions ───────────────────────────────────────

  runLifecycleAction(action: LifecycleAction): void {
    const recommended = this.recommendedPlan && this.recommendedPlan.planCode;
    switch (action.kind) {
      case 'upgrade':
        this.openUpgradeRoute([recommended, this.currentPlanSlug]);
        return;
      case 'reactivate':
        this.openUpgradeRoute([this.currentPlanSlug, recommended]);
        return;
      case 'compare':
        this.focusPlanSection('compare');
        return;
      case 'plans':
        this.focusPlanSection('plans');
        return;
      case 'contact_billing':
        this.contactBillingSupport();
        return;
    }
  }

  /**
   * Opens the upgrade route of the first candidate an employer can buy self-serve.
   * With the catalog loaded that is the plan's own `upgradeRoute`, the one its card
   * uses, so the Free Trial and Enterprise (no route) are skipped. Before the catalog
   * arrives, the slug route the recommendation card uses. With no candidate at all,
   * the plan cards themselves.
   *
   * navigateToUpgrade() is not reused: it returns silently for the current plan,
   * which is exactly the plan a cancelled employer reactivates, and the plan an
   * expired one on Growth (sent no recommendation) chooses again.
   */
  private openUpgradeRoute(candidates: Array<string | null | undefined>): void {
    for (const candidate of candidates) {
      if (!candidate) { continue; }
      const slug = candidate === 'premium' ? 'business' : candidate;
      if (this.catalog) {
        const plan = this.catalogPlans.find(p => p.slug === slug);
        if (plan && plan.upgradeRoute && !plan.enterprise && !plan.contactSalesRequired) {
          this.router.navigateByUrl(plan.upgradeRoute);
          return;
        }
      } else if (slug !== 'none' && slug !== 'free_trial' && slug !== 'enterprise') {
        this.router.navigate(['/recruiter/subscription/upgrade', slug]);
        return;
      }
    }
    this.focusPlanSection('plans');
  }

  @ViewChild('plansHeading') plansHeading?: ElementRef<HTMLElement>;
  @ViewChild('compareHeading') compareHeading?: ElementRef<HTMLElement>;

  /** Set when the page was opened as ?compare=1, until Compare plans has been focused. */
  private compareRequested = false;

  /**
   * Honours ?compare=1 once the page can. Compare plans renders only after BOTH the summary
   * (the page's main content) and the catalog (the table itself) have settled, so this runs
   * whenever either settles and acts only when neither is still loading. After a failed
   * summary the request stays pending, so a successful Retry still takes the employer there.
   */
  private focusRequestedSection(): void {
    if (!this.compareRequested || this.loading || this.catalogLoading || this.loadError) { return; }
    this.compareRequested = false;
    this.focusPlanSection('compare');
  }

  /**
   * Scrolls to a section heading on the Plan tab and moves focus to it, so keyboard
   * and screen-reader users land where sighted users are taken. The banner sits above
   * the tabs, so the Plan tab opens first. Compare plans renders only once the catalog
   * has plans; until then the destination is Available plans, which shows the
   * catalog's loading or error state.
   */
  focusPlanSection(section: 'compare' | 'plans'): void {
    this.switchTab('plan');
    // The tab's content and the heading queries update on the change detection that
    // follows this handler, so the lookup waits one task.
    setTimeout(() => {
      const target = (section === 'compare' && this.compareHeading) || this.plansHeading;
      if (!target) { return; }
      target.nativeElement.scrollIntoView({ behavior: this.planCarouselMotionAllowed ? 'smooth' : 'auto', block: 'start' });
      target.nativeElement.focus({ preventScroll: true });
    }, 0);
  }

  /** Shown in the billing banner as text, so a device with no mail client still has somewhere to write. */
  readonly supportEmail = SUPPORT_EMAIL;

  /**
   * Billing recovery goes to support by email. Payments are one-off PayMongo links and
   * no card is stored, so there is no payment method to update and no retry to call.
   */
  get billingSupportHref(): string {
    return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('GetHired billing support')}`;
  }

  contactBillingSupport(): void {
    window.location.href = this.billingSupportHref;
  }

  isCurrentCatalogPlan(plan: PlanCatalogItem): boolean {
    return this.ctaFor(plan).kind === 'current';
  }

  /** trackBy so toggling the billing cycle re-renders prices, not whole cards. */
  trackPlanBySlug(_index: number, plan: PlanCatalogItem): string {
    return plan.slug;
  }

  // --- Status helpers ---

  get statusLabel(): string {
    const status = this.summary && this.summary.currentPlan && this.summary.currentPlan.status;
    const map: { [k: string]: string } = {
      none: 'No plan',
      trialing: 'Trial active',
      trial_ending_soon: 'Trial ending soon',
      active: 'Active',
      past_due: 'Past due',
      payment_failed: 'Payment failed',
      pending: 'Pending',
      cancelled: 'Cancelled',
      expired: 'Expired',
      manual: 'Active',
    };
    return (status && map[status]) || 'Unknown';
  }

  get statusClass(): string {
    const status = this.summary && this.summary.currentPlan && this.summary.currentPlan.status;
    if (status === 'active' || status === 'manual') { return 'gh-sub-status-badge--active'; }
    if (status === 'trialing' || status === 'trial_ending_soon') { return 'gh-sub-status-badge--trial'; }
    if (status === 'payment_failed' || status === 'past_due') { return 'gh-sub-status-badge--danger'; }
    if (status === 'pending' || status === 'cancelled' || status === 'expired') { return 'gh-sub-status-badge--warning'; }
    return 'gh-sub-status-badge--neutral';
  }

  /**
   * The hero's call to action for the current status, or null when there is nothing
   * to act on. It never reloads: Retry under the error state is the only button on
   * this page that calls loadSummary().
   */
  get heroAction(): LifecycleAction | null {
    const status = this.currentStatus;
    if (status === 'none' || status === 'expired') { return CHOOSE_PLAN; }
    if (status === 'trialing' || status === 'trial_ending_soon') { return UPGRADE_NOW; }
    if (status === 'payment_failed' || status === 'past_due') { return CONTACT_BILLING; }
    if (status === 'cancelled') { return REACTIVATE_PLAN; }
    // A pending payment has nothing to act on until it verifies; re-fetching is not an action.
    if (status === 'pending') { return null; }
    return CHANGE_PLAN;
  }

  /** The lifecycle banner's button, for the statuses whose banner asks the employer to act. */
  get bannerAction(): LifecycleAction | null {
    const status = this.currentStatus;
    if (status === 'none' || status === 'expired') { return COMPARE_PLANS; }
    if (status === 'trialing' || status === 'trial_ending_soon') { return UPGRADE_NOW; }
    if (status === 'payment_failed' || status === 'past_due') { return CONTACT_BILLING; }
    return null;
  }

  get bannerVariant(): string {
    const status = this.summary && this.summary.currentPlan && this.summary.currentPlan.status;
    if (status === 'payment_failed' || status === 'past_due') { return 'danger'; }
    if (status === 'pending' || status === 'trial_ending_soon') { return 'warning'; }
    if (status === 'active' || status === 'manual') { return 'success'; }
    if (status === 'trialing') { return 'info'; }
    return 'neutral';
  }

  get currentPlanName(): string {
    return (this.summary && this.summary.currentPlan && this.summary.currentPlan.name) || 'No plan';
  }

  get companyName(): string {
    if (this.companyDetails && this.companyDetails.companyName) {
      return this.companyDetails.companyName;
    }
    if (this.summary && this.summary.company && this.summary.company.name) {
      return this.summary.company.name;
    }
    return '';
  }

  get renewalDate(): string {
    const end = this.summary && this.summary.currentPlan && this.summary.currentPlan.currentPeriodEnd;
    if (!end) { return '—'; }
    return new Date(end).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  get trialEndDate(): string | null {
    const explicit = this.summary && this.summary.currentPlan && this.summary.currentPlan.trialEndsAt;
    if (explicit) {
      return new Date(explicit).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
    }
    // Fall back to currentPeriodEnd for trial statuses — BE derives trial end from plan creation + 7 days.
    const s = this.currentStatus;
    if (s === 'trialing' || s === 'trial_ending_soon') {
      const fallback = this.summary && this.summary.currentPlan && this.summary.currentPlan.currentPeriodEnd;
      if (fallback) {
        return new Date(fallback).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
      }
    }
    return null;
  }

  get hasTrialEndDate(): boolean {
    return this.trialEndDate !== null;
  }

  get currentStatus(): string {
    return (this.summary && this.summary.currentPlan && this.summary.currentPlan.status) || 'none';
  }

  // --- Invoice helpers ---

  getInvoiceStatusClass(status: string): string {
    if (status === 'paid') { return 'gh-invoice-chip--paid'; }
    if (status === 'pending') { return 'gh-invoice-chip--pending'; }
    if (status === 'failed') { return 'gh-invoice-chip--failed'; }
    if (status === 'trial') { return 'gh-invoice-chip--trial'; }
    return 'gh-invoice-chip--neutral';
  }

  formatAmount(amount: number, currency: string): string {
    if (amount === null || amount === undefined) { return '—'; }
    const sym = currency && currency.toUpperCase() === 'PHP' ? '₱' : (currency || '') + ' ';
    return sym + amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // --- FAQ ---

  /**
   * FAQ entries the current catalog can truthfully answer. The Recruitment Storage and
   * per-job video-question answers describe entitlements the production catalog does
   * not model; showing them there would explain a limit nothing enforces. They appear
   * automatically once any plan in the catalog carries the field.
   */
  get visibleFaqItems(): Array<{ q: string; a: string; requires?: keyof PlanEntitlements }> {
    return this.faqItems.filter(item =>
      !item.requires || this.catalogPlans.some(p => isModelled(p.entitlements, item.requires!)));
  }

  isFaqOpen(q: string): boolean {
    return this.openFaqs.has(q);
  }

  toggleFaq(q: string): void {
    if (this.openFaqs.has(q)) { this.openFaqs.delete(q); } else { this.openFaqs.add(q); }
  }

  // --- Lifecycle ---

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    clearInterval(this.planCarouselTimer);
    clearTimeout(this.planCarouselResumeTimer);
    clearTimeout(this.planCarouselResizeDebounce);
    this.planCarouselResizeObserver?.disconnect();
  }

  // ── Subtab navigation ───────────────────────────────────────────────────────

  switchTab(tab: 'plan' | 'invoices' | 'billing-profile'): void {
    this.activeTab = tab;
    if (tab === 'invoices' && this.invoices.length === 0 && !this.invoicesLoading) {
      this.loadInvoices();
    }
  }

  // ── Invoice Vault methods ───────────────────────────────────────────────────

  loadInvoices(): void {
    this.invoicesLoading = true;
    this.invoicesError = null;
    this.invoiceFallbackMode = false;

    this.billing.listInvoices({ limit: 20, offset: 0 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.invoicesLoading = false;
          if (res && res.success) {
            this.invoices = res.invoices || [];
            this.invoicesTotal = res.total || 0;
          } else {
            this.useSummaryInvoices();
          }
        },
        error: () => {
          this.invoicesLoading = false;
          this.useSummaryInvoices();
        }
      });
  }

  /**
   * Production versions that predate the Invoice Vault routes still include a
   * payment history in the authenticated subscription summary. Use that record
   * as a read-only history instead of presenting a load error. No invoice detail,
   * PDF, or send action is claimed when the dedicated billing API is unavailable.
   */
  private useSummaryInvoices(): void {
    const records = (this.summary && this.summary.invoices) || [];
    this.invoiceFallbackMode = true;
    this.invoicesError = null;
    this.invoices = records.map(record => ({
      id: String(record.id),
      invoiceNumber: String(record.id),
      status: record.status,
      currency: record.currency || 'PHP',
      totalAmount: record.amount,
      planName: record.planName || record.description || 'Subscription',
      billingCycle: null,
      billingPeriodStart: null,
      billingPeriodEnd: null,
      issuedAt: record.date,
      paidAt: record.status === 'paid' ? record.date : null,
      createdAt: record.date,
      paymentMethodLabel: record.paymentMethodLabel || null,
      hasDownload: !!record.receiptUrl,
    }));
    this.invoicesTotal = this.invoices.length;
  }

  openInvoiceDrawer(invoiceId: string): void {
    if (this.invoiceFallbackMode) { return; }
    this.selectedInvoiceId = invoiceId;
  }

  closeInvoiceDrawer(): void {
    this.selectedInvoiceId = null;
  }

  openInvoiceSend(invoice: InvoiceListItem): void {
    this.dialog.open(InvoiceSendModalComponent, {
      width: '480px',
      maxWidth: '96vw',
      panelClass: 'gh-dialog',
      data: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        currentEmail: null,
      }
    });
  }

  formatInvoiceDate(d: string | null | undefined): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  formatInvoicePeriod(start: string | null | undefined, end: string | null | undefined): string {
    if (!start || !end) return '—';
    const opts: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(start).toLocaleDateString('en-PH', opts) + ' – ' + new Date(end).toLocaleDateString('en-PH', opts);
  }

  viewInvoicePdf(invoice: InvoiceListItem): void {
    const url = this.billing.getInvoiceViewUrl(invoice.id);
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
