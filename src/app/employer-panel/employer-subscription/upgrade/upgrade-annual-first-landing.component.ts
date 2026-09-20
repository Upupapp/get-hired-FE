import {
  Component, OnInit, OnDestroy, ChangeDetectionStrategy,
  ChangeDetectorRef, PLATFORM_ID, Inject,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { SubscriptionPricingCatalogService } from '../services/subscription-pricing-catalog.service';
import { EmployerUpgradePreview, SubscriptionCheckoutIntentService } from '../services/subscription-checkout-intent.service';
import { SubscriptionUpgradeRecommendationService, UpgradeRecommendation } from '../services/subscription-upgrade-recommendation.service';
import { PlanCatalogItem, BillingCycle } from '../subscription-v4.models';
import { APPROVED_PRICING_CATALOG } from '../approved-pricing-catalog';

// Stable copy keys → UI copy
const COPY_MAP: Record<string, { title: string; subtitle: string }> = {
  trial_expired:       { title: 'Continue hiring with GetHired', subtitle: 'Your free trial has ended. Choose a plan to publish or reopen jobs, add team members, or add screening questions.' },
  trial_ending:        { title: 'Keep your hiring momentum', subtitle: 'Your free trial is ending soon. Choose a plan to publish or reopen jobs, add team members, or add screening questions.' },
  job_limit_reached:   { title: 'Upgrade to publish more jobs', subtitle: 'You\'ve used your free active job post. This job is saved as a draft. Upgrade to publish more roles.' },
  admin_limit_reached: { title: 'Add your hiring team', subtitle: 'Need help from your team? Upgrade to add more admin users.' },
  video_limit_reached: { title: 'Keep receiving video responses', subtitle: 'You\'re at your video response limit. Upgrade to keep collecting richer applicant answers.' },
  job_near_90:         { title: 'Almost at your job post limit', subtitle: 'You\'re close to your active job limit. Upgrade now for uninterrupted hiring.' },
  video_near_90:       { title: 'Almost at your video response limit', subtitle: 'You\'re close to your video response limit. Upgrade to keep receiving richer applicant answers.' },
  job_near_70:         { title: 'Upgrade your hiring capacity', subtitle: 'You\'re using most of your active job post slots. Consider upgrading for more flexibility.' },
  first_applicant:     { title: 'Your first applicant has arrived', subtitle: 'Your first job is live and receiving applicants. Upgrade when you\'re ready for more hiring capacity.' },
  first_video_response:{ title: 'Your first video response is in', subtitle: 'You\'ve received your first video response. Upgrade to keep collecting richer applicant answers.' },
  general_upgrade:     { title: 'Upgrade your hiring capacity', subtitle: 'Get more active job posts, admin users, and video responses with a paid plan.' },
  annual_savings_general: { title: 'Save more with annual billing', subtitle: 'Switch to an annual plan and get 12 months for the price of 10.' },
  default:             { title: 'Upgrade your hiring capacity', subtitle: 'Choose a billing cycle below and unlock more of GetHired\'s hiring workspace.' },
};

const FEATURE_LIST = [
  { icon: 'building', label: 'Customized company page', detail: 'Showcase your employer brand to job seekers.' },
  { icon: 'video', label: 'Video interview questions', detail: 'Collect video answers from applicants before scheduling interviews.' },
  { icon: 'users', label: 'Applicant management dashboard', detail: 'Track, filter, and manage applicants from one place.' },
  { icon: 'briefcase', label: 'Job posting tools', detail: 'Publish, manage, and promote your open roles.' },
];

@Component({
  selector: 'app-upgrade-annual-first-landing',
  templateUrl: './upgrade-annual-first-landing.component.html',
  styleUrls: ['./upgrade-annual-first-landing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpgradeAnnualFirstLandingComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private previewRequest = 0;

  loading = true;
  checkoutLoading = false;
  loadError = false;
  checkoutError: string | null = null;
  preview: EmployerUpgradePreview | null = null;
  previewLoading = false;
  previewError: string | null = null;

  planSlug: string = '';
  plan: PlanCatalogItem | null = null;
  recommendation: UpgradeRecommendation | null = null;
  showComparison = false;

  selectedCycle: BillingCycle = 'monthly';

  readonly featureList = FEATURE_LIST;
  private isBrowser: boolean;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pricingCatalogService: SubscriptionPricingCatalogService,
    private checkoutIntentService: SubscriptionCheckoutIntentService,
    private recommendationService: SubscriptionUpgradeRecommendationService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.planSlug = this.route.snapshot.paramMap.get('planSlug') || '';
    const trigger = this.route.snapshot.queryParamMap.get('trigger') || 'upgrade_landing_viewed';
    this.loadAll(trigger);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAll(trigger: string = 'upgrade_landing_viewed'): void {
    this.loading = true;
    this.loadError = !this.isKnownPlan;
    const normalizedSlug = this.planSlug === 'premium' ? 'business' : this.planSlug;
    this.plan = APPROVED_PRICING_CATALOG.plans.find(p => p.slug === normalizedSlug) || null;
    if (!this.loadError) { this.loadPreview(); }

    this.pricingCatalogService.getCatalog()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res && res.catalog && res.catalog.plans) {
            this.plan = res.catalog.plans.find(p => p.slug === this.planSlug) || null;
          }
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: () => { this.loading = false; this.cdr.markForCheck(); },
      });

    // Load recommendation (non-blocking — page works without it)
    this.recommendationService.getRecommendation(trigger, 'upgrade_landing')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res && res.recommendation) {
            this.recommendation = res.recommendation;
            this.cdr.markForCheck();
          }
        },
        error: () => {}, // Non-blocking
      });

    // Analytics: fire upgrade_landing_viewed
    this.recommendationService.recordEvent('upgrade_landing_viewed', {
      currentPlan: this.planSlug,
      defaultBillingCycle: 'monthly',
      surface: 'upgrade_landing',
    });

  }

  loadPlan(): void { this.loadAll(); }

  selectCycle(cycle: BillingCycle): void {
    const wasAnnual = this.selectedCycle === 'annual';
    this.selectedCycle = cycle;
    this.checkoutError = null;
    this.loadPreview();
    this.cdr.markForCheck();
    // Analytics
    if (cycle === 'monthly' && wasAnnual) {
      this.recommendationService.recordEvent('billing_toggle_monthly_selected', { planSlug: this.planSlug });
    } else if (cycle === 'annual' && !wasAnnual) {
      this.recommendationService.recordEvent('billing_toggle_annual_selected', { planSlug: this.planSlug });
    }
  }

  toggleComparison(): void {
    this.showComparison = !this.showComparison;
    if (this.showComparison) {
      this.recommendationService.recordEvent('plan_comparison_opened', { planSlug: this.planSlug });
    }
  }

  get isAnnual(): boolean { return this.selectedCycle === 'annual'; }
  get isKnownPlan(): boolean { return ['starter','growth','business','premium'].indexOf(this.planSlug) !== -1; }
  get planName(): string { return this.plan?.name || ({starter:'Starter',growth:'Growth',business:'Premium',premium:'Premium'} as Record<string,string>)[this.planSlug] || 'Plan'; }

  get heroTitle(): string {
    if (!this.recommendation) return COPY_MAP['default'].title;
    return (COPY_MAP[this.recommendation.copyKey] || COPY_MAP['default']).title;
  }

  get heroSubtitle(): string {
    if (!this.recommendation) return COPY_MAP['default'].subtitle;
    return (COPY_MAP[this.recommendation.copyKey] || COPY_MAP['default']).subtitle;
  }

  get displayPrice(): string {
    if (this.preview) {
      const amount = this.preview.amountMinor / 100 / (this.isAnnual ? 12 : 1);
      return new Intl.NumberFormat('en-PH', {style:'currency',currency:this.preview.currency,maximumFractionDigits:0}).format(amount);
    }
    const pricing = this.plan && (this.isAnnual ? this.plan.pricing.annual : this.plan.pricing.monthly);
    if (pricing && typeof pricing.amount === 'number') {
      const amount = this.isAnnual ? pricing.amount / 12 : pricing.amount;
      return new Intl.NumberFormat('en-PH', {style:'currency',currency:'PHP',maximumFractionDigits:0}).format(amount);
    }
    return '—';
  }

  get dueTodayLabel(): string {
    if (this.preview) { return `${this.formatMinor(this.preview.amountMinor, this.preview.currency)} due today`; }
    if (this.previewLoading) { return 'Confirming amount'; }
    const pricing = this.plan && (this.isAnnual ? this.plan.pricing.annual : this.plan.pricing.monthly);
    return pricing && typeof pricing.amount === 'number'
      ? `${new Intl.NumberFormat('en-PH',{style:'currency',currency:'PHP',minimumFractionDigits:2}).format(pricing.amount)} due today`
      : 'Checkout unavailable';
  }

  get renewalLabel(): string {
    return this.isAnnual
      ? 'Paid annually. Your plan renews after 12 months.'
      : 'Paid monthly, recurring. Cancel or switch anytime from your subscription settings.';
  }

  get annualSavingsCopy(): string | null {
    return this.plan && this.plan.pricing.annual.savingsCopy;
  }

  get annualSavingsAmount(): number {
    if (!this.plan) return 0;
    return this.plan.pricing.annual.annualSavingsAmount || 0;
  }

  get primaryCtaLabel(): string {
    return this.isAnnual ? 'Continue with annual billing' : 'Continue with monthly billing';
  }

  get tabAnnualLabel(): string { return 'Annual subscription package'; }
  get tabMonthlyLabel(): string { return 'Monthly subscription package'; }

  get entitlementRows(): Array<{ label: string; value: string }> {
    if (this.preview?.entitlements) {
      const e = this.preview.entitlements;
      const value = (key:string) => typeof e[key] === 'number' ? String(e[key]) : 'Custom';
      return [
        {label:'Active job posts',value:value('jobs')},
        {label:'Admin users',value:value('users')},
        {label:'Recruitment Storage',value:typeof e['storage']==='number' ? `${Number(e['storage'])/1000000000} GB` : 'Custom'},
        {label:'Video questions per job',value:value('video')},
      ];
    }
    if (!this.plan) return [];
    const ents = this.plan.entitlements;
    return [
      { label: 'Active job posts', value: ents.active_job_posts === null ? 'Custom' : String(ents.active_job_posts) },
      { label: 'Team users', value: ents.admin_users === null ? 'Custom' : String(ents.admin_users) },
      { label: 'Recruitment storage', value: typeof ents.recruitment_storage_bytes === 'number' ? `${ents.recruitment_storage_bytes / 1073741824} GB` : 'Custom' },
      { label: 'Video questions per job', value: ents.video_questions_per_job === null ? 'Custom' : String(ents.video_questions_per_job || 0) },
    ];
  }

  get comparisonData() {
    return this.recommendation && this.recommendation.comparison;
  }

  get currentPlanName(): string {
    return this.recommendation && this.recommendation.currentPlan
      ? this.recommendation.currentPlan.name
      : 'Current plan';
  }

  startCheckout(): void {
    // Upgrade preview improves the page, but checkout itself is the authoritative
    // server-priced operation. Older production runtimes may not expose preview,
    // so its failure must not disable the real PayMongo checkout request.
    if (!this.isKnownPlan || this.checkoutLoading || this.previewLoading) return;
    this.checkoutLoading = true;
    this.checkoutError = null;
    this.cdr.markForCheck();

    this.recommendationService.recordEvent('checkout_started', {
      planSlug: this.planSlug,
      billingCycleSelected: this.selectedCycle,
      surface: 'upgrade_landing',
    });

    const idempotencyKey = this.checkoutIdempotencyKey();
    this.checkoutIntentService.createCheckoutIntent({
      planCode: this.planSlug === 'business' ? 'premium' : this.planSlug,
      billingCycle: this.selectedCycle,
      idempotencyKey,
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        this.checkoutLoading = false;
        if (res?.success === true && res.paymentAttemptId && res.checkoutUrl && this.isBrowser && this.isSafeCheckoutUrl(res.checkoutUrl)) {
          sessionStorage.setItem('gethired.paymentAttemptId', res.paymentAttemptId);
          sessionStorage.removeItem(this.checkoutKeyStorageName());
          window.location.assign(res.checkoutUrl);
        } else if (res?.success === true && res.paymentAttemptId) {
          this.router.navigate(['/recruiter/subscription/checkout-return'], {
            queryParams: { attempt: res.paymentAttemptId },
          });
        } else {
          this.checkoutError = 'We couldn\'t prepare checkout right now. Please try again.';
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.checkoutLoading = false;
        this.checkoutError = this.checkoutErrorFor(err?.error?.code);
        this.cdr.markForCheck();
      },
    });
  }

  goBack(): void { this.router.navigate(['/recruiter/subscription']); }
  goCompare(): void { this.router.navigate(['/recruiter/subscription'], { queryParams: { compare: '1' } }); }

  private createIdempotencyKey(): string {
    if (this.isBrowser && window.crypto?.getRandomValues) {
      const bytes = new Uint8Array(16);
      window.crypto.getRandomValues(bytes);
      return Array.from(bytes).map(value => value.toString(16).padStart(2, '0')).join('');
    }
    return `checkout_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }

  private checkoutKeyStorageName(): string { return `gethired.checkoutKey.${this.planSlug}.${this.selectedCycle}`; }
  private checkoutIdempotencyKey(): string {
    if (!this.isBrowser) { return this.createIdempotencyKey(); }
    const storageName = this.checkoutKeyStorageName();
    const existing = sessionStorage.getItem(storageName);
    if (existing) { return existing; }
    const created = this.createIdempotencyKey();
    sessionStorage.setItem(storageName, created);
    return created;
  }

  private isSafeCheckoutUrl(value: string): boolean {
    try { return new URL(value).protocol === 'https:'; } catch (_) { return false; }
  }

  private checkoutErrorFor(code: string | undefined): string {
    if (code === 'INVALID_BILLING_CYCLE') { return 'That billing cycle is not available. Choose monthly billing or review the plans.'; }
    if (code === 'SUBSCRIPTION_ALREADY_ACTIVE') { return 'This subscription is already active. Refresh your subscription details to see the latest status.'; }
    if (code === 'UPGRADE_NOT_ALLOWED') { return 'This plan change is not available for the current subscription.'; }
    if (code === 'BILLING_FORBIDDEN') { return 'Only an account owner or billing administrator can start checkout.'; }
    if (code === 'BILLING_UNAVAILABLE') { return 'Billing is temporarily unavailable. Please try again later.'; }
    return 'We couldn\'t prepare checkout right now. Please try again.';
  }

  private loadPreview(): void {
    if (!this.isKnownPlan) { return; }
    const request = ++this.previewRequest;
    this.previewLoading = true; this.preview = null; this.previewError = null;
    this.checkoutIntentService.previewUpgrade({planCode:this.planSlug === 'business' ? 'premium' : this.planSlug,billingCycle:this.selectedCycle})
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: preview => { if(request!==this.previewRequest){return;} this.previewLoading = false; this.preview = preview?.success === true && Number.isSafeInteger(preview.amountMinor) && preview.amountMinor > 0 && preview.currency === 'PHP' && preview.billingCycle === this.selectedCycle ? preview : null; this.previewError = null; this.cdr.markForCheck(); },
        error: () => { if(request!==this.previewRequest){return;} this.previewLoading = false; this.preview = null; this.previewError = null; this.cdr.markForCheck(); },
      });
  }

  private formatMinor(amountMinor:number,currency:string):string {
    return new Intl.NumberFormat('en-PH',{style:'currency',currency,minimumFractionDigits:2}).format(amountMinor/100);
  }
}
