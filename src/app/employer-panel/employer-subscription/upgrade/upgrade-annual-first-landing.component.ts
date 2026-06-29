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
import { PlanCatalogItem, BillingCycle } from '../subscription-v4.models';

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

  // Annual tab is active by default
  selectedCycle: BillingCycle = 'annual';

  private isBrowser: boolean;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pricingCatalogService: SubscriptionPricingCatalogService,
    private checkoutIntentService: SubscriptionCheckoutIntentService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.planSlug = this.route.snapshot.paramMap.get('planSlug') || '';
    this.loadPlan();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPlan(): void {
    this.loading = true;
    this.loadError = false;
    this.pricingCatalogService.getCatalog()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res && res.catalog && res.catalog.plans) {
            const found = res.catalog.plans.find(p => p.slug === this.planSlug) || null;
            this.plan = found;
            if (!found) this.loadError = true;
          } else {
            this.loadError = true;
          }
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.loadError = true;
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  selectCycle(cycle: BillingCycle): void {
    this.selectedCycle = cycle;
    this.checkoutError = null;
    this.cdr.markForCheck();
  }

  get isAnnual(): boolean { return this.selectedCycle === 'annual'; }

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
      { label: 'Video interview questions', value: ents.video_interview_questions ? 'Included' : 'Not included' },
      { label: 'Dedicated support', value: ents.dedicated_support ? 'Included' : 'Not included' },
    ];
  }

  startCheckout(): void {
    if (!this.plan || this.checkoutLoading) return;
    this.checkoutLoading = true;
    this.checkoutError = null;
    this.cdr.markForCheck();

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
          // No checkout URL — navigate to subscription page with pending status
          this.router.navigate(['/recruiter/subscription'], { queryParams: { pending: res.checkoutIntentId } });
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

  goBack(): void {
    this.router.navigate(['/recruiter/subscription']);
  }

  goCompare(): void {
    this.router.navigate(['/recruiter/subscription'], { queryParams: { compare: '1' } });
  }
}
