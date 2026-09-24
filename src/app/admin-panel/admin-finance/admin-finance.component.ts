import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, takeUntil } from 'rxjs/operators';
import { AdminTimeRange, rangeKey, readTimeQuery, resolvePreset, timeQueryParams } from '../admin-time';
import { AdminFinance, AdminPaymentRow, AdminSubscriptionRow } from '../admin.model';
import { AdminService } from '../admin.service';
import {
  billingCycleLabel,
  billingStatusClass,
  billingStatusLabel,
  formatAdminDay,
  formatAdminMoney,
  readHttpError,
  readPage,
} from '../admin.normalize';

type FinanceTab = 'subscriptions' | 'payments';

@Component({
  selector: 'app-admin-finance',
  templateUrl: './admin-finance.component.html',
  styleUrls: ['./admin-finance.component.scss']
})
export class AdminFinanceComponent implements OnInit, OnDestroy {
  readonly pageSize = 25;
  readonly fixtureFootnote = 'Amounts are fixtures until Clarence wires billing APIs.';
  readonly mrrFootnote = 'MRR = current monthly recurring (snapshot).';
  readonly planFilters = [
    { value: '', label: 'All plans' },
    { value: 'free_trial', label: 'Free trial' },
    { value: 'starter', label: 'Starter' },
    { value: 'growth', label: 'Growth' },
    { value: 'business', label: 'Business' },
    { value: 'other', label: 'Other' },
  ];
  readonly subscriptionStatuses = [
    { value: '', label: 'All statuses' },
    { value: 'trialing', label: 'Trialing' },
    { value: 'active', label: 'Active' },
    { value: 'past_due', label: 'Past due' },
    { value: 'grace', label: 'Grace' },
    { value: 'expired', label: 'Expired' },
    { value: 'none', label: 'None' },
  ];
  readonly paymentStatuses = [
    { value: '', label: 'All statuses' },
    { value: 'succeeded', label: 'Succeeded' },
    { value: 'failed', label: 'Failed' },
    { value: 'pending', label: 'Pending' },
  ];

  finance: AdminFinance | null = null;
  searchText = '';
  tab: FinanceTab = 'subscriptions';
  plan = '';
  subscriptionStatus = '';
  paymentStatus = '';
  range: AdminTimeRange = resolvePreset('7d');
  loading = false;
  error = '';

  private q = '';
  private page = 1;
  private paymentPage = 1;
  private loadedKey = '';
  private fetchSeq = 0;
  private searchInput$ = new Subject<string>();
  private destroy$ = new Subject<void>();
  private listSub: Subscription | null = null;

  constructor(
    private adminService: AdminService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.pipe(
      map(params => this.paramKey(params)),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      const state = this.readParams(this.route.snapshot.queryParamMap);
      this.q = state.q;
      this.searchText = state.q;
      this.tab = state.tab;
      this.plan = state.plan;
      this.subscriptionStatus = state.subscriptionStatus;
      this.paymentStatus = state.paymentStatus;
      this.page = state.page;
      this.paymentPage = state.paymentPage;
      this.range = state.range;
      if (state.range.invalid) {
        this.loading = false;
        this.finance = null;
        return;
      }
      const key = [
        state.q, state.plan, state.subscriptionStatus, state.paymentStatus,
        state.page, state.paymentPage, rangeKey(state.range),
      ].join('|');
      if (key !== this.loadedKey) {
        this.loadedKey = key;
        this.fetch();
      }
    });

    this.searchInput$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.page = 1;
      this.paymentPage = 1;
      this.pushQuery();
    });
  }

  ngOnDestroy(): void {
    if (this.listSub) {
      this.listSub.unsubscribe();
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearch(value: string): void {
    this.searchText = value;
    this.searchInput$.next(value);
  }

  applySearch(): void {
    this.page = 1;
    this.paymentPage = 1;
    this.pushQuery();
  }

  onRange(next: AdminTimeRange): void {
    this.range = next;
    this.paymentPage = 1;
    this.pushQuery();
  }

  selectTab(tab: FinanceTab): void {
    if (tab === this.tab) {
      return;
    }
    this.tab = tab;
    this.pushQuery();
  }

  onTabKey(event: KeyboardEvent, index: number): void {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') {
      return;
    }
    event.preventDefault();
    const tabs: FinanceTab[] = ['subscriptions', 'payments'];
    const next = event.key === 'ArrowRight' ? index + 1 : index - 1;
    this.selectTab(tabs[(next + tabs.length) % tabs.length]);
  }

  togglePlan(slug: string): void {
    this.plan = this.plan === slug ? '' : slug;
    this.tab = 'subscriptions';
    this.page = 1;
    this.pushQuery();
  }

  onSubscriptionStatus(value: string): void {
    this.subscriptionStatus = value;
    this.page = 1;
    this.pushQuery();
  }

  onPaymentStatus(value: string): void {
    this.paymentStatus = value;
    this.paymentPage = 1;
    this.pushQuery();
  }

  onPlanSelect(value: string): void {
    this.plan = value;
    this.page = 1;
    this.pushQuery();
  }

  goToSubscriptions(page: number): void {
    if (page < 1 || page === this.page) {
      return;
    }
    this.page = page;
    this.pushQuery();
  }

  goToPayments(page: number): void {
    if (page < 1 || page === this.paymentPage) {
      return;
    }
    this.paymentPage = page;
    this.pushQuery();
  }

  retry(): void {
    this.fetch();
  }

  money(value: number | null | undefined): string {
    return formatAdminMoney(value, this.finance ? this.finance.currency : 'PHP');
  }

  when(value: string | null): string {
    return formatAdminDay(value);
  }

  statusLabel(status: string): string {
    return billingStatusLabel(status);
  }

  statusClass(status: string): string {
    return billingStatusClass(status);
  }

  cycle(value: string): string {
    return billingCycleLabel(value);
  }

  external(value: string): string {
    if (!value) {
      return '—';
    }
    return value.length > 14 ? `${value.slice(0, 12)}…` : value;
  }

  openSubscription(event: MouseEvent, row: AdminSubscriptionRow): void {
    if ((event.target as HTMLElement).closest('a')) {
      return;
    }
    this.router.navigate(['/admin/companies', row.companyId], { queryParams: { tab: 'subscription' } });
  }

  openPayment(event: MouseEvent, row: AdminPaymentRow): void {
    if ((event.target as HTMLElement).closest('a')) {
      return;
    }
    this.router.navigate(['/admin/companies', row.companyId], { queryParams: { tab: 'payments' } });
  }

  trackSubscription(_index: number, row: AdminSubscriptionRow): string {
    return row.companyId;
  }

  trackPayment(_index: number, row: AdminPaymentRow): string {
    return row.paymentId || row.externalId;
  }

  private paramKey(params: ParamMap): string {
    return [
      params.get('q') || '',
      params.get('tab') || '',
      params.get('plan') || '',
      params.get('status') || '',
      params.get('payStatus') || '',
      params.get('page') || '',
      params.get('payPage') || '',
      params.get('range') || '',
      params.get('from') || '',
      params.get('to') || '',
    ].join('|');
  }

  private readParams(params: ParamMap): {
    q: string;
    tab: FinanceTab;
    plan: string;
    subscriptionStatus: string;
    paymentStatus: string;
    page: number;
    paymentPage: number;
    range: AdminTimeRange;
  } {
    const tab = params.get('tab') === 'payments' ? 'payments' : 'subscriptions';
    return {
      q: params.get('q') || '',
      tab,
      plan: params.get('plan') || '',
      subscriptionStatus: params.get('status') || '',
      paymentStatus: params.get('payStatus') || '',
      page: readPage(params.get('page')),
      paymentPage: readPage(params.get('payPage')),
      range: readTimeQuery(params),
    };
  }

  private pushQuery(): void {
    const time = timeQueryParams(this.range);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        q: this.searchText.trim() || null,
        tab: this.tab === 'payments' ? 'payments' : null,
        plan: this.plan || null,
        status: this.subscriptionStatus || null,
        payStatus: this.paymentStatus || null,
        page: this.page > 1 ? this.page : null,
        payPage: this.paymentPage > 1 ? this.paymentPage : null,
        range: time.range,
        from: time.from,
        to: time.to,
      },
    });
  }

  private fetch(): void {
    if (this.listSub) {
      this.listSub.unsubscribe();
    }
    const seq = ++this.fetchSeq;
    this.loading = true;
    this.error = '';
    this.listSub = this.adminService.getFinance({
      range: this.range.preset,
      q: this.q,
      plan: this.plan,
      subscriptionStatus: this.subscriptionStatus,
      paymentStatus: this.paymentStatus,
      from: this.range.from,
      to: this.range.to,
      page: this.page,
      pageSize: this.pageSize,
      paymentPage: this.paymentPage,
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: result => {
        if (seq !== this.fetchSeq) {
          return;
        }
        this.loading = false;
        this.finance = result;
      },
      error: err => {
        if (seq !== this.fetchSeq) {
          return;
        }
        this.loading = false;
        this.finance = null;
        this.error = readHttpError(err, 'Could not load finance.');
      }
    });
  }
}
