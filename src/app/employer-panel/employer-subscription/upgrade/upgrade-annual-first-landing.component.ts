import {
  Component, OnInit, OnDestroy, ChangeDetectionStrategy,
  ChangeDetectorRef, PLATFORM_ID, Inject,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { SubscriptionPricingCatalogService } from '../services/subscription-pricing-catalog.service';
import { SubscriptionCheckoutIntentService } from '../services/subscription-checkout-intent.service';
import { SubscriptionUpgradeRecommendationService, UpgradeRecommendation } from '../services/subscription-upgrade-recommendation.service';
import { PlanCatalogItem, BillingCycle } from '../subscription-v4.models';

// Stable copy keys → UI copy
const COPY_MAP: Record<string, { title: string; subtitle: string }> = {
  trial_expired:       { title: 'Continue hiring with GetHired', subtitle: 'Your free trial has ended. Choose a plan to keep publishing jobs.' },
  trial_ending:        { title: 'Keep your hiring momentum', subtitle: 'Your free trial is ending soon. Upgrade to keep your company page, job posts, and video interviews active.' },
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

  loading = true;
  checkoutLoading = false;
  loadError = false;
  checkoutError: string | null = null;

  planSlug: string = '';
  plan: PlanCatalogItem | null = null;
  recommendation: UpgradeRecommendation | null = null;
  showComparison = false;

  selectedCycle: BillingCycle = 'annual';

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
    this.loadError = false;

    this.pricingCatalogService.getCatalog()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res && res.catalog && res.catalog.plans) {
            this.plan = res.catalog.plans.find(p => p.slug === this.planSlug) || null;
            if (!this.plan) this.loadError = true;
          } else {
            this.loadError = true;
          }
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: () => { this.loadError = true; this.loading = false; this.cdr.markForCheck(); },
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
      defaultBillingCycle: 'annual',
      surface: 'upgrade_landing',
    });

    // Analytics: fire annual_tab_defaulted on load
    this.recommendationService.recordEvent('annual_tab_defaulted', {
      planSlug: this.planSlug,
      surface: 'upgrade_landing',
    });
  }

  loadPlan(): void { this.loadAll(); }

  selectCycle(cycle: BillingCycle): void {
    const wasAnnual = this.selectedCycle === 'annual';
    this.selectedCycle = cycle;
    this.checkoutError = null;
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

  get heroTitle(): string {
    if (!this.recommendation) return COPY_MAP['default'].title;
    return (COPY_MAP[this.recommendation.copyKey] || COPY_MAP['default']).title;
  }

  get heroSubtitle(): string {
    if (!this.recommendation) return COPY_MAP['default'].subtitle;
    return (COPY_MAP[this.recommendation.copyKey] || COPY_MAP['default']).subtitle;
  }

  get displayPrice(): string {
    if (!this.plan) return '';
    if (this.isAnnual) return this.plan.pricing.annual.effectiveMonthlyLabel;
    return this.plan.pricing.monthly.label;
  }

  get dueTodayLabel(): string {
    if (!this.plan) return '';
    if (this.isAnnual) return this.plan.pricing.annual.dueTodayLabel;
    return this.plan.pricing.monthly.renewalLabel;
  }

  get renewalLabel(): string {
    if (!this.plan) return '';
    return this.isAnnual ? this.plan.pricing.annual.renewalLabel : this.plan.pricing.monthly.renewalLabel;
  }

  get annualSavingsCopy(): string | null {
    if (!this.plan || !this.isAnnual) return null;
    return this.plan.pricing.annual.savingsCopy;
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
    if (!this.plan) return [];
    const ents = this.plan.entitlements;
    return [
      { label: 'Active job posts', value: ents.active_job_posts < 0 ? 'Unlimited' : String(ents.active_job_posts) },
      { label: 'Admin users', value: ents.admin_users < 0 ? 'Unlimited' : String(ents.admin_users) },
      { label: 'Video responses', value: ents.video_responses < 0 ? 'Unlimited' : String(ents.video_responses) },
      { label: 'Company page', value: ents.customized_company_page ? 'Included' : 'Not included' },
      { label: 'Video interviews', value: ents.video_interview_questions ? 'Included' : 'Not included' },
      { label: 'Dedicated support', value: ents.dedicated_support ? 'Included' : 'Not included' },
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
    if (!this.plan || this.checkoutLoading) return;
    this.checkoutLoading = true;
    this.checkoutError = null;
    this.cdr.markForCheck();

    this.recommendationService.recordEvent('checkout_started', {
      planSlug: this.planSlug,
      billingCycleSelected: this.selectedCycle,
      surface: 'upgrade_landing',
    });

    this.checkoutIntentService.createCheckoutIntent({
      planSlug: this.planSlug,
      billingCycle: this.selectedCycle,
      sourceSurface: 'upgrade_landing',
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        this.checkoutLoading = false;
        if (res && res.checkoutUrl && this.isBrowser) {
          window.location.href = res.checkoutUrl;
        } else if (res && res.checkoutIntentId) {
          this.router.navigate(['/recruiter/subscription/checkout-return'], {
            queryParams: { intent: res.checkoutIntentId },
          });
        } else {
          this.checkoutError = 'We couldn\'t prepare checkout right now. Please try again.';
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.checkoutLoading = false;
        const msg = (err && err.error && err.error.message) || 'We couldn\'t prepare checkout right now. Please try again.';
        this.checkoutError = msg;
        this.cdr.markForCheck();
      },
    });
  }

  goBack(): void { this.router.navigate(['/recruiter/subscription']); }
  goCompare(): void { this.router.navigate(['/recruiter/subscription'], { queryParams: { compare: '1' } }); }
}
