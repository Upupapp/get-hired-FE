import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { CompanyFacade } from '@main/company/state/company.facade';
import { SubscriptionSummaryService } from './subscription-summary.service';
import { EmployerSubscriptionSummary, EntitlementUsage, BooleanEntitlement } from './subscription.models';

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
export class EmployerSubscriptionComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  loading = true;
  loadError = false;
  summary: EmployerSubscriptionSummary | null = null;
  companyDetails: any = null;

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
        { label: '2 active job posts', included: true },
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

  get trialEndDate(): string {
    const end = this.summary && this.summary.currentPlan && this.summary.currentPlan.trialEndsAt;
    if (!end) { return '—'; }
    return new Date(end).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
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
  }
}
