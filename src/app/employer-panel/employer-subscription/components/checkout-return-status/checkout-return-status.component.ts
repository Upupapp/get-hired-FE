import {
  Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SubscriptionCheckoutIntentService, PaymentAttemptStatusResponse } from '../../services/subscription-checkout-intent.service';
import { EngagementRefreshBus } from '@main/shared/engagement/engagement-refresh.bus';

/** A return that changed the subscription, so the engagement context is read again (contract §3.1). */
const SETTLED_RETURN_STATUSES = ['payment_success_confirmed', 'payment_failed', 'payment_expired'];

@Component({
  selector: 'app-checkout-return-status',
  template: `
    <div class="checkout-return" role="main" aria-label="Payment status">

      <!-- Checking state (shimmer) -->
      <div *ngIf="returnStatus === 'checking_payment'" class="checkout-return__checking" aria-busy="true" aria-live="polite">
        <div class="checkout-shimmer checkout-shimmer--icon"></div>
        <div class="checkout-shimmer checkout-shimmer--title"></div>
        <div class="checkout-shimmer checkout-shimmer--body"></div>
        <p class="checkout-return__checking-label" aria-label="Checking payment status">Checking payment status…</p>
      </div>

      <!-- Success -->
      <div *ngIf="returnStatus === 'payment_success_confirmed'" class="checkout-return__success" role="status" aria-live="polite">
        <div class="checkout-return__icon checkout-return__icon--success" aria-hidden="true">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="rgba(22,163,74,0.12)"/>
            <path d="M7 12.5l3.5 3.5 6.5-7" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
              class="checkout-return__check-path"/>
          </svg>
        </div>
        <h1 class="checkout-return__title">{{ activatedPlanName ? activatedPlanName + ' is now active' : 'Payment confirmed' }}</h1>
        <p class="checkout-return__message">{{ userMessage }}</p>
        <div class="checkout-return__billing-pill" *ngIf="isAnnual" aria-label="Annual billing active">
          Annual billing · 12 months
        </div>
        <div class="checkout-return__billing-pill checkout-return__billing-pill--monthly" *ngIf="!isAnnual" aria-label="Monthly billing active">
          Monthly billing · renews monthly
        </div>
        <button class="checkout-return__btn checkout-return__btn--primary" type="button" (click)="goToDashboard()">
          Go to dashboard
        </button>
      </div>

      <!-- Pending -->
      <div *ngIf="returnStatus === 'payment_pending'" class="checkout-return__pending" role="status" aria-live="polite">
        <div class="checkout-return__icon checkout-return__icon--pending" aria-hidden="true">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#6C6BAD" stroke-width="2" class="checkout-return__pending-ring"/>
            <path d="M12 6v6l4 2" stroke="#6C6BAD" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <h1 class="checkout-return__title">Payment pending</h1>
        <p class="checkout-return__message">{{ userMessage }}</p>
        <button class="checkout-return__btn checkout-return__btn--ghost" type="button" (click)="checkAgain()">
          Check again
        </button>
        <a class="checkout-return__link" [routerLink]="['/recruiter/subscription']">View subscription</a>
      </div>

      <!-- Failed -->
      <div *ngIf="returnStatus === 'payment_failed'" class="checkout-return__failed" role="alert" aria-live="assertive">
        <div class="checkout-return__icon checkout-return__icon--failed" aria-hidden="true">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="rgba(220,38,38,0.08)"/>
            <path d="M12 8v5M12 16h.01" stroke="#dc2626" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <h1 class="checkout-return__title">Payment unsuccessful</h1>
        <p class="checkout-return__message">Your payment did not go through. Please try again or use a different payment method. Your data is safe.</p>
        <button class="checkout-return__btn checkout-return__btn--danger" type="button" (click)="tryAgain()">
          Try again
        </button>
        <a class="checkout-return__link" [routerLink]="['/recruiter/subscription']">Back to pricing</a>
      </div>

      <!-- Expired -->
      <div *ngIf="returnStatus === 'payment_expired'" class="checkout-return__expired" role="status" aria-live="polite">
        <div class="checkout-return__icon checkout-return__icon--expired" aria-hidden="true">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#f59e0b" stroke-width="2"/>
            <path d="M12 6v6l3 3" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <h1 class="checkout-return__title">Payment link expired</h1>
        <p class="checkout-return__message">Your payment link has expired. Generate a new link to complete your subscription.</p>
        <button class="checkout-return__btn checkout-return__btn--primary" type="button" (click)="goToSubscription()">
          Generate new link
        </button>
      </div>

      <!-- Unknown / retry -->
      <div *ngIf="returnStatus === 'payment_unknown_retry'" class="checkout-return__unknown" role="status" aria-live="polite">
        <h1 class="checkout-return__title">Checking your payment…</h1>
        <p class="checkout-return__message">We couldn't confirm your payment status right now. Please wait a moment and check again.</p>
        <button class="checkout-return__btn checkout-return__btn--ghost" type="button" (click)="checkAgain()">
          Check again
        </button>
        <a class="checkout-return__link" [routerLink]="['/recruiter/subscription']">View subscription</a>
      </div>

      <!-- Error -->
      <div *ngIf="loadError" class="checkout-return__error" role="alert">
        <p>We couldn't load your payment status. Please try again.</p>
        <button class="checkout-return__btn checkout-return__btn--ghost" type="button" (click)="loadStatus()">Retry</button>
      </div>

    </div>
  `,
  styleUrls: ['./checkout-return-status.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutReturnStatusComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private stopPolling$ = new Subject<void>();
  private pollCount = 0;
  private statusLoading = false;
  private static readonly MAX_POLLS = 24;

  intentId: string = '';
  returnStatus: string = 'checking_payment';
  userMessage: string = '';
  billingCycle: string = 'monthly';
  loadError = false;
  activatedPlanName: string | null = null;
  private lastSettledStatus: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private checkoutService: SubscriptionCheckoutIntentService,
    private cdr: ChangeDetectorRef,
    private refreshBus: EngagementRefreshBus,
  ) {}

  ngOnInit(): void {
    this.intentId = this.route.snapshot.queryParamMap.get('attempt') || this.route.snapshot.queryParamMap.get('intent') || this.storedAttemptId();
    if (!this.intentId) {
      this.returnStatus = 'payment_unknown_retry';
      this.cdr.markForCheck();
      return;
    }
    this.loadStatus();
    // Poll every 5 seconds for pending status (stop after confirmed or failed)
    interval(5000)
      .pipe(takeUntil(this.stopPolling$), takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.pollCount >= CheckoutReturnStatusComponent.MAX_POLLS) {
          this.returnStatus = 'payment_unknown_retry';
          this.stopPolling$.next();
          this.cdr.markForCheck();
        } else if (this.returnStatus === 'payment_pending' || this.returnStatus === 'checking_payment') {
          this.loadStatus();
        } else {
          this.stopPolling$.next();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.stopPolling$.next();
    this.stopPolling$.complete();
  }

  loadStatus(): void {
    if (!this.intentId || this.statusLoading) return;
    this.statusLoading = true;
    this.loadError = false;
    this.pollCount += 1;
    this.checkoutService.getCheckoutIntentStatus(this.intentId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.statusLoading = false;
          this.returnStatus = res.success === true ? this.mapStatus(res.status) : 'payment_unknown_retry';
          this.activatedPlanName = this.returnStatus === 'payment_success_confirmed' && res.subscription?.status === 'active' ? this.planName(res.subscription.planCode) : null;
          this.userMessage = this.messageFor(res);
          this.billingCycle = res.billingCycle || 'monthly';
          if (SETTLED_RETURN_STATUSES.indexOf(this.returnStatus) !== -1 && this.returnStatus !== this.lastSettledStatus) {
            this.lastSettledStatus = this.returnStatus;
            this.refreshBus.request('checkout_return');
          }
          if (this.returnStatus !== 'payment_pending' && this.returnStatus !== 'checking_payment') {
            this.stopPolling$.next();
            if (SETTLED_RETURN_STATUSES.indexOf(this.returnStatus) !== -1) { this.clearStoredAttempt(); }
          }
          this.cdr.markForCheck();
        },
        error: () => {
          this.statusLoading = false;
          this.returnStatus = 'payment_unknown_retry';
          this.loadError = true;
          this.cdr.markForCheck();
        },
      });
  }

  get isAnnual(): boolean { return this.billingCycle === 'annual'; }

  checkAgain(): void { this.loadStatus(); }
  goToDashboard(): void { this.router.navigate(['/recruiter/dashboard']); }
  goToSubscription(): void { this.router.navigate(['/recruiter/subscription']); }
  tryAgain(): void { this.router.navigate(['/recruiter/subscription']); }

  private mapStatus(status: string): string {
    return status === 'PAID' ? 'payment_success_confirmed'
      : status === 'FAILED' ? 'payment_failed'
      : status === 'EXPIRED' ? 'payment_expired'
      : status === 'PENDING' ? 'payment_pending' : 'payment_unknown_retry';
  }

  private messageFor(response: PaymentAttemptStatusResponse): string {
    if (response.status === 'PAID') { return 'Your payment is confirmed and your updated hiring capacity is ready.'; }
    if (response.status === 'PENDING') { return 'We are waiting for secure payment confirmation. You can leave this page and check again later.'; }
    return '';
  }

  private planName(code: string | null | undefined): string | null {
    if (!code) { return null; }
    return code.replace(/_/g, ' ').replace(/\b\w/g, value => value.toUpperCase());
  }

  private storedAttemptId(): string {
    return typeof sessionStorage === 'undefined' ? '' : sessionStorage.getItem('gethired.paymentAttemptId') || '';
  }

  private clearStoredAttempt(): void {
    if (typeof sessionStorage !== 'undefined') { sessionStorage.removeItem('gethired.paymentAttemptId'); }
  }
}
