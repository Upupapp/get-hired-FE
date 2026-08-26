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

interface PlanConfig {
  code: string;
  name: string;
  audience: string;
  priceLabel: string;
  recommended?: boolean;
  trial?: boolean;
  enterprise?: boolean;
  features: Array<{ label: string; included: boolean }>;
}

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

  // FAQ accordion state — each index tracks open/closed
  faqOpen: boolean[] = [false, false, false, false, false, false, false];

  readonly faqItems = [
    {
      q: 'What happens when my free trial ends?',
      a: 'When your free trial expires, your active job posts will be paused and you will lose access to premium features. Choose a paid plan before your trial ends to keep your hiring running without interruption.'
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
      q: 'Are video responses included in all plans?',
      a: 'Video responses are not included in the Free Trial. The Starter plan includes 5 video responses. Growth, Premium, and Enterprise plans include video responses — unlimited on Growth and above.'
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

  readonly PLAN_CONFIGS: PlanConfig[] = [
    {
      code: 'free_trial',
      name: 'Free Trial',
      audience: 'Try GetHired with limited hiring tools.',
      priceLabel: 'Free',
      trial: true,
      features: [
        { label: '5 active job posts', included: true },
        { label: 'Applicant tracking', included: true },
        { label: 'Company profile', included: true },
        { label: 'Interview questions', included: true },
        { label: 'Video responses', included: false },
        { label: 'Public company profile', included: false },
      ],
    },
    {
      code: 'starter',
      name: 'Starter',
      audience: 'For small employers hiring occasionally.',
      priceLabel: '₱999/mo',
      features: [
        { label: '5 active job posts', included: true },
        { label: 'Applicant tracking', included: true },
        { label: 'Company profile', included: true },
        { label: 'Interview questions', included: true },
        { label: '5 video responses', included: true },
        { label: 'Public company profile', included: false },
      ],
    },
    {
      code: 'growth',
      name: 'Growth',
      audience: 'For active hiring teams.',
      priceLabel: '₱2,499/mo',
      recommended: true,
      features: [
        { label: '15 active job posts', included: true },
        { label: '3 admin users', included: true },
        { label: 'Candidate messaging', included: true },
        { label: 'Interview workflow', included: true },
        { label: 'Video responses', included: true },
        { label: 'Public company profile', included: true },
        { label: 'Employer branding', included: true },
      ],
    },
    {
      code: 'premium',
      name: 'Premium',
      audience: 'For frequent hiring and larger teams.',
      priceLabel: '₱4,999/mo',
      features: [
        { label: '30 active job posts', included: true },
        { label: '5 admin users', included: true },
        { label: 'Candidate messaging', included: true },
        { label: 'Video interviews', included: true },
        { label: 'Advanced analytics', included: true },
        { label: 'Public company profile', included: true },
        { label: 'Priority support', included: true },
      ],
    },
    {
      code: 'enterprise',
      name: 'Enterprise',
      audience: 'For large employers and custom hiring operations.',
      priceLabel: 'Custom',
      enterprise: true,
      features: [
        { label: 'Custom job volume', included: true },
        { label: 'Custom admin users', included: true },
        { label: 'Candidate messaging', included: true },
        { label: 'Video interviews', included: true },
        { label: 'Custom billing', included: true },
        { label: 'Dedicated support', included: true },
      ],
    },
  ];

  constructor(
    public companyFacade: CompanyFacade,
    private subscriptionSummaryService: SubscriptionSummaryService,
    private router: Router,
    private dialog: MatDialog,
    private billing: BillingService,
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
  // Presentational-only: auto-advances one PAGE every 2s (not one card --
  // see below), pauses on hover/touch/manual interaction, and never touches
  // plan data, CTA handlers, or current-plan/recommended detection below.
  //
  // AUDIT FIX: the original version indexed by individual card and used
  // getBoundingClientRect-style math to find "the closest card" on scroll,
  // with one dot per card -- on wide screens where 2-3 cards are visible at
  // once, that produced more dots than there were real places to stop, and
  // dot-click / scroll-sync could disagree with where the track actually
  // landed. Rewritten to page-based scrolling: a "slide" is exactly one
  // viewport-width of the track, so slideCount = ceil(scrollWidth /
  // clientWidth) always matches the number of distinct positions the
  // track can actually rest at -- one dot per real stopping point, on any
  // screen size, at any card width, recalculated on resize.
  @ViewChild('planCarouselTrack') planCarouselTrack?: ElementRef<HTMLElement>;

  planCarouselActiveSlide = 0;
  planCarouselSlideCount = 1;
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
    setTimeout(() => this.updatePagination(), 0);

    // PRODUCTION HARDENING: a plain window:resize listener only fires on
    // actual viewport resize -- it misses font-load reflow, a sidebar/drawer
    // toggling elsewhere on the page, browser zoom, or the track's own
    // content changing width for any other reason. ResizeObserver watches
    // the track element itself, so any of those cases recalculate
    // geometry too. Single resize-handling mechanism (no window listener
    // running alongside it), debounced so a drag-resize doesn't thrash.
    if (typeof ResizeObserver !== 'undefined' && this.planCarouselTrack?.nativeElement) {
      this.planCarouselResizeObserver = new ResizeObserver(() => {
        clearTimeout(this.planCarouselResizeDebounce);
        this.planCarouselResizeDebounce = setTimeout(() => this.updatePagination(/* fromResize */ true), 120);
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

  /** CAROUSEL calculation hub: the viewport (track) determines slide
   *  geometry, slide geometry determines pagination -- cards never drive
   *  this math directly. Recomputes slide count from actual scroll
   *  geometry (not plan/card count), re-clamps + instantly re-snaps the
   *  active slide so a resize can never leave the track resting between
   *  two pages, and refreshes edge-affordance/arrow state. Call this any
   *  time the track's available geometry may have changed (init, resize).
   */
  private updatePagination(fromResize: boolean = false): void {
    const track = this.planCarouselTrack?.nativeElement;
    if (!track || track.clientWidth === 0) { return; }

    this.planCarouselSlideCount = this.calculateSlideCount(track);
    const clamped = Math.min(this.planCarouselActiveSlide, this.planCarouselSlideCount - 1);
    this.planCarouselActiveSlide = Math.max(0, clamped);

    if (fromResize) {
      // Instant, not smooth -- a resize must never produce a visible
      // "jump" animation, it just re-anchors to where the layout already
      // put the content.
      track.scrollTo({ left: this.planCarouselActiveSlide * track.clientWidth, behavior: 'auto' });
    }

    this.syncScrollBoundaryState(track);
  }

  /** Number of distinct viewport-sized positions the track can rest at --
   *  the true page count, independent of how many cards happen to fit per
   *  page at the current width. */
  private calculateSlideCount(track: HTMLElement): number {
    return Math.max(1, Math.round(track.scrollWidth / track.clientWidth));
  }

  advancePlanCarousel(): void {
    const nextSlide = (this.planCarouselActiveSlide + 1) % this.planCarouselSlideCount;
    this.scrollToSlide(nextSlide);
  }

  /** Moves the track to the given logical page (smooth). Cards occupy
   *  stable positions within each page; this never targets an individual
   *  card. */
  scrollToSlide(slide: number): void {
    const track = this.planCarouselTrack?.nativeElement;
    if (!track) { return; }
    this.planCarouselActiveSlide = slide;
    track.scrollTo({ left: slide * track.clientWidth, behavior: 'smooth' });
  }

  /** Manual dot/arrow click: jump to that page and pause auto-advance briefly
   *  so the carousel doesn't yank focus away right after someone picks one. */
  goToPlanSlide(slide: number): void {
    this.scrollToSlide(slide);
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
   *  manually swipes/drags/scrolls the track (mouse or touch). */
  syncActiveSlide(): void {
    const track = this.planCarouselTrack?.nativeElement;
    if (!track || track.clientWidth === 0) { return; }
    this.planCarouselActiveSlide = Math.round(track.scrollLeft / track.clientWidth);
    this.syncScrollBoundaryState(track);
  }

  /** Whether there's genuinely more content to the left/right of the
   *  current scroll position -- drives both the edge-fade visibility and
   *  could gate arrow affordance. A 1px tolerance absorbs sub-pixel
   *  scroll-position rounding across browsers. */
  private syncScrollBoundaryState(track: HTMLElement): void {
    this.planCarouselCanScrollPrev = track.scrollLeft > 1;
    this.planCarouselCanScrollNext = track.scrollLeft < track.scrollWidth - track.clientWidth - 1;
  }

  /** Array of the real slide count, purely for the dots *ngFor -- see
   *  updatePagination()/calculateSlideCount(); intentionally NOT plan-count-based. */
  get planCarouselSlides(): number[] {
    return Array.from({ length: this.planCarouselSlideCount }, (_, i) => i);
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

  get recommendedPlanConfig(): PlanConfig | null {
    if (!this.recommendedPlan) { return null; }
    return this.PLAN_CONFIGS.find(p => p.code === this.recommendedPlan.planCode) || null;
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

  getPlanCta(planCode: string): string {
    const current = this.summary && this.summary.currentPlan && this.summary.currentPlan.code;
    if (!current || current === 'none' || current === null) { return 'Choose plan'; }
    if (current === planCode) { return 'Current plan'; }
    const order = ['free_trial', 'starter', 'growth', 'premium', 'enterprise'];
    const currentIdx = order.indexOf(current);
    const targetIdx = order.indexOf(planCode);
    if (planCode === 'enterprise') { return 'Contact sales'; }
    if (targetIdx > currentIdx) { return 'Upgrade'; }
    return 'Switch plan';
  }

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

  getEffectivePlanConfigs(): PlanConfig[] {
    // If backend returns available plans, try to enrich; otherwise use defaults
    if (this.summary && this.summary.availablePlans && this.summary.availablePlans.length > 0) {
      return this.PLAN_CONFIGS;
    }
    return this.PLAN_CONFIGS;
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

  toggleFaq(idx: number): void {
    this.faqOpen[idx] = !this.faqOpen[idx];
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
