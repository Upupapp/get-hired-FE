import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, takeUntil } from 'rxjs/operators';
import { AdminTimeRange, rangeKey, readTimeQuery, resolvePreset, sparklinePoints, timeQueryParams, visitDirection } from '../admin-time';
import { AdminFinance, AdminPaymentRow, AdminSubscriptionRow } from '../admin.model';
import { AdminService } from '../admin.service';
import { formatAdminDay, formatAdminMoney, readHttpError, readPage } from '../admin.normalize';

@Component({
  selector: 'app-admin-finance',
  templateUrl: './admin-finance.component.html',
  styleUrls: ['./admin-finance.component.scss']
})
export class AdminFinanceComponent implements OnInit, OnDestroy {
  readonly pageSize = 25;
  readonly revenueFootnote =
    'Revenue sums paid charges in the selected range. Amounts are fixtures until GET /admin/finance is live.';
  readonly snapshotFootnote =
    'Active, trial, canceled, plan counts, and MRR are a current snapshot of the whole book, not the date range.';

  finance: AdminFinance | null = null;
  searchText = '';
  range: AdminTimeRange = resolvePreset('7d');
  loading = false;
  error = '';

  companyId = '';

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
      this.companyId = state.companyId;
      this.page = state.page;
      this.paymentPage = state.paymentPage;
      this.range = state.range;
      if (state.range.invalid) {
        this.loading = false;
        this.finance = null;
        return;
      }
      const key = `${state.q}|${state.companyId}|${state.page}|${state.paymentPage}|${rangeKey(state.range)}`;
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
    this.page = 1;
    this.paymentPage = 1;
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

  clearCompany(): void {
    this.companyId = '';
    this.page = 1;
    this.paymentPage = 1;
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

  spark(): string {
    const series = (this.finance && this.finance.revenueSeries) || [];
    return sparklinePoints(series.map(point => ({ count: point.amount })));
  }

  direction(): string {
    if (!this.finance) {
      return 'none';
    }
    return visitDirection(this.finance.revenueInRange, this.finance.revenuePrevious);
  }

  revenueDelta(): string {
    if (!this.finance) {
      return '';
    }
    const total = this.finance.revenueInRange;
    const previous = this.finance.revenuePrevious;
    const absolute = total - previous;
    const arrow = absolute > 0 ? '▲' : absolute < 0 ? '▼' : '–';
    const amount = formatAdminMoney(Math.abs(absolute), this.finance.currency);
    const signed = absolute > 0 ? `+${amount}` : absolute < 0 ? `−${amount}` : amount;
    if (previous === 0) {
      return `${arrow} ${signed} vs prior period`;
    }
    const percent = Math.round((absolute / previous) * 100);
    const percentSign = percent > 0 ? '+' : '';
    return `${arrow} ${percentSign}${percent}% · ${signed} vs prior period`;
  }

  planHint(slug: string): string {
    if (slug === 'enterprise') {
      return 'Contracted fixture MRR. Public price is Custom.';
    }
    if (slug === 'free_trial') {
      return 'Trial does not add MRR.';
    }
    return 'MRR from active subscriptions only.';
  }

  trackSubscription(_index: number, row: AdminSubscriptionRow): string {
    return row.subscriptionId || row.companyId;
  }

  trackPayment(_index: number, row: AdminPaymentRow): string {
    return row.paymentId || row.invoiceId;
  }

  private paramKey(params: ParamMap): string {
    return [
      params.get('q') || '',
      params.get('company') || '',
      params.get('page') || '',
      params.get('payPage') || '',
      params.get('range') || '',
      params.get('from') || '',
      params.get('to') || '',
    ].join('|');
  }

  private readParams(params: ParamMap): {
    q: string;
    companyId: string;
    page: number;
    paymentPage: number;
    range: AdminTimeRange;
  } {
    return {
      q: params.get('q') || '',
      companyId: params.get('company') || '',
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
        company: this.companyId || null,
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
      companyId: this.companyId,
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
