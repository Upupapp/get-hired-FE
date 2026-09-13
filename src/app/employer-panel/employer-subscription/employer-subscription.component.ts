import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { CompanyFacade } from '@main/company/state/company.facade';
import { SubscriptionSummaryService } from './subscription-summary.service';
import { EmployerSubscriptionSummary, EntitlementUsage, BooleanEntitlement, InvoiceListItem } from './subscription.models';
import { BillingService } from './services/billing.service';
import { InvoiceSendModalComponent } from './components/invoice-send-modal/invoice-send-modal.component';
import { SubscriptionPricingCatalogService } from './services/subscription-pricing-catalog.service';
import { BillingCycle, PlanCatalogItem, PlanEntitlements, PricingCatalog } from './subscription-v4.models';
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
} from './plan-presentation.model';


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
      a: 'Your existing applications remain safe. New video responses and file uploads may be paused until storage is freed or your capacity is increased. Nothing already submitted to you is deleted because you reached the limit.'
    },
    {
      q: 'Can I delete old applications or media to free storage?',
      requires: 'recruitment_storage_bytes',
      a: 'Yes, subject to the platform\'s retention and deletion rules.'
    },
    {
      q: 'What happens when my free trial ends?',
      a: 'When your free trial expires, your active job posts will be paused and you will lose access to paid features. Choose a plan before your trial ends to keep your hiring running without interruption.'
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
      a: 'If a payment fails, you will see a "Fix payment" button on this page. Click it to update your payment method or retry the charge. Your plan will remain active for a short grace period while you resolve the issue.'
    },
    {
      q: 'Who do I contact for billing help?',
      a: 'For billing questions, reach out to our support team at support@gethired.ph. Enterprise customers have a dedicated account manager.'
    },
  ];


  // ── Backend pricing catalog ─────────────────────────────────────────────────
  // Every price, capacity and Recruitment Storage figure rendered on this page
  // comes from here. Nothing about plan content is decided in the frontend.
  catalog: PricingCatalog | null = null;
  catalogLoading = true;
  catalogError = false;

  /** Selected billing cycle for the pricing cards. Seeded from the catalog. */
  billingCycle: BillingCycle = 'monthly';

  // Recruitment Storage: the plan's CAPACITY is modelled only by the catalog in gh-be's
  // uncommitted tree — production (`origin/main`) does not send the field — so the cards,
  // Compare plans and the storage FAQ show it only when the catalog does (isModelled).
  // How much an employer has CONSUMED reaches the frontend through no endpoint at all;
  // gh-be has uncommitted metering but nothing serves it. The usage meter, its
  // 70/80/90/100% warning states and the per-category breakdown are therefore not
  // built at all rather than rendered from invented numbers. See BE-P2 in
  // GETHIRED_PRICING_BACKEND_DEPENDENCIES.md for the field requested; build the
  // meter in the commit that consumes it.

  constructor(
    public companyFacade: CompanyFacade,
    private subscriptionSummaryService: SubscriptionSummaryService,
    private router: Router,
    private dialog: MatDialog,
    private billing: BillingService,
    private pricingCatalogService: SubscriptionPricingCatalogService,
  ) {}

  ngOnInit(): void {
    // Read company data without dispatching clearing actions
    this.companyFacade.companyDetails$
      .pipe(takeUntil(this.destroy$))
      .subscribe(details => {
        this.companyDetails = details;
      });

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
    if (typeof ResizeObserver !== 'undefined' && this.planCarouselTrack?.nativeElement) {
      this.planCarouselResizeObserver = new ResizeObserver(() => {
        clearTimeout(this.planCarouselResizeDebounce);
        this.planCarouselResizeDebounce = setTimeout(() => this.syncScrollBoundaryState(), 120);
      });
      this.planCarouselResizeObserver.observe(this.planCarouselTrack.nativeElement);
    }

    this.startPlanCarouselAutoScroll();
  }

  private startPlanCarouselAutoScroll(): void {
    if (typeof window === 'undefined') { return; }
    // Never auto-move content for users who've asked for reduced motion --
    // manual dot/arrow navigation still works either way.
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { return; }

    this.planCarouselTimer = setInterval(() => {
      if (this.planCarouselPaused) { return; }
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
        },
        (_err) => {
          this.loadError = true;
          this.loading = false;
        }
      );

    this.loadPricingCatalog();
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
        },
        (_err) => {
          // No local price fallback by design. Showing a stale hardcoded figure
          // is what produced the advertise-2,499 / charge-3,490 mismatch this
          // page is being fixed for; an honest empty state is safer than a
          // confident wrong number.
          this.catalog = null;
          this.catalogError = true;
          this.catalogLoading = false;
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
  // prices always won. That is how the page came to advertise PHP 2,499 for
  // Growth while planCatalogServiceV4 charged PHP 3,490.

  /** Plans to render, straight from the backend catalog. Empty until it loads. */
  get catalogPlans(): PlanCatalogItem[] {
    return (this.catalog && this.catalog.plans) ? this.catalog.plans : [];
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

  ctaFor(plan: PlanCatalogItem): PlanCta {
    return planCta(plan, this.orderedSlugs, this.currentPlanSlug);
  }

  get comparisonGroups(): ComparisonGroup[] {
    return buildComparison(this.catalogPlans);
  }

  /** True when the backend offers both cycles, so the toggle is never a no-op. */
  get canToggleBillingCycle(): boolean {
    return !!(this.catalog && this.catalog.monthlyAvailable && this.catalog.annualAvailable);
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
    // upgradeRoute is the backend's own route for this plan; it is null for the
    // trial and for Enterprise, so an absent route is a deliberate "no checkout".
    if (plan.upgradeRoute) {
      this.router.navigateByUrl(plan.upgradeRoute);
    }
  }

  contactSales(): void {
    window.location.href = 'mailto:support@gethired.ph?subject=GetHired%20Enterprise%20enquiry';
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

  get primaryCta(): string {
    const status = this.summary && this.summary.currentPlan && this.summary.currentPlan.status;
    if (!status || status === 'none' || status === 'expired') { return 'Choose a plan'; }
    if (status === 'trialing' || status === 'trial_ending_soon') { return 'Upgrade now'; }
    if (status === 'payment_failed' || status === 'past_due') { return 'Fix payment'; }
    if (status === 'pending') { return 'Check status'; }
    if (status === 'cancelled') { return 'Reactivate plan'; }
    return 'Manage plan';
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

    this.billing.listInvoices({ limit: 20, offset: 0 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.invoicesLoading = false;
          if (res && res.success) {
            this.invoices = res.invoices || [];
            this.invoicesTotal = res.total || 0;
          } else {
            this.invoicesError = 'We couldn\'t load your invoices.';
          }
        },
        error: () => {
          this.invoicesLoading = false;
          this.invoicesError = 'We couldn\'t load your invoices. Please try again.';
        }
      });
  }

  openInvoiceDrawer(invoiceId: string): void {
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
