import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { distinctUntilChanged, map, takeUntil } from 'rxjs/operators';
import { AdminTimeRange, resolvePreset, timeQueryParams, validateCustomRange } from '../admin-time';
import { AdminCompanyContact, AdminCompanyDetail, AdminCompanyEvent, AdminPaymentRow } from '../admin.model';
import { AdminService } from '../admin.service';
import {
  billingCycleLabel,
  billingStatusClass,
  billingStatusLabel,
  formatAdminDay,
  formatAdminMoney,
  readHttpError,
} from '../admin.normalize';

type CompanyTab = 'overview' | 'subscription' | 'payments' | 'history';

@Component({
  selector: 'app-admin-company-detail',
  templateUrl: './admin-company-detail.component.html',
  styleUrls: ['./admin-company-detail.component.scss']
})
export class AdminCompanyDetailComponent implements OnInit, OnDestroy {
  readonly tabs: { id: CompanyTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'subscription', label: 'Subscription' },
    { id: 'payments', label: 'Payments' },
    { id: 'history', label: 'History' },
  ];

  detail: AdminCompanyDetail | null = null;
  companyId = '';
  tab: CompanyTab = 'overview';
  paymentRange: AdminTimeRange | null = null;
  readonly allHistoryRange: AdminTimeRange = resolvePreset('7d');
  showAllAdmins = false;
  loading = false;
  error = '';

  private loadedId = '';
  private fetchSeq = 0;
  private destroy$ = new Subject<void>();
  private detailSub: Subscription | null = null;

  constructor(
    private adminService: AdminService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(
      map(params => params.get('companyId') || ''),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(companyId => {
      this.companyId = companyId;
      this.showAllAdmins = false;
      if (!companyId) {
        this.detail = null;
        this.error = 'Company not found';
        return;
      }
      if (companyId !== this.loadedId) {
        this.loadedId = companyId;
        this.fetch();
      }
    });

    this.route.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.tab = this.readTab(params.get('tab'));
      this.paymentRange = this.readPaymentRange(params);
    });
  }

  ngOnDestroy(): void {
    if (this.detailSub) {
      this.detailSub.unsubscribe();
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  retry(): void {
    this.fetch();
  }

  selectTab(tab: CompanyTab): void {
    this.tab = tab;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: tab === 'overview' ? null : tab },
      queryParamsHandling: 'merge',
    });
  }

  onTabKey(event: KeyboardEvent, index: number): void {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') {
      return;
    }
    event.preventDefault();
    const next = event.key === 'ArrowRight' ? index + 1 : index - 1;
    const tab = this.tabs[(next + this.tabs.length) % this.tabs.length];
    this.selectTab(tab.id);
  }

  showAllHistory(): void {
    this.paymentRange = null;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: 'payments', payRange: null, payFrom: null, payTo: null },
      queryParamsHandling: 'merge',
    });
  }

  onPaymentRange(next: AdminTimeRange): void {
    this.paymentRange = next;
    const time = timeQueryParams(next);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        tab: 'payments',
        payRange: time.range,
        payFrom: time.from,
        payTo: time.to,
      },
      queryParamsHandling: 'merge',
    });
  }

  toggleAdmins(): void {
    this.showAllAdmins = true;
  }

  money(value: number | null | undefined): string {
    return formatAdminMoney(value, 'PHP');
  }

  when(value: string | null): string {
    return formatAdminDay(value);
  }

  count(value: number | null): string {
    return value == null ? '—' : String(value);
  }

  statusLabel(status: string | null): string {
    return billingStatusLabel(status);
  }

  statusClass(status: string | null): string {
    return billingStatusClass(status);
  }

  cycle(value: string | null): string {
    return billingCycleLabel(value);
  }

  external(value: string): string {
    if (!value) {
      return '—';
    }
    return value.length > 14 ? `${value.slice(0, 12)}…` : value;
  }

  meterWidth(used: number, limit: number | null): string {
    if (limit == null || limit <= 0) {
      return '0%';
    }
    return `${Math.min(100, Math.round((used / limit) * 100))}%`;
  }

  meterText(used: number, limit: number | null): string {
    if (limit == null) {
      return `${used} · no cap in catalog`;
    }
    return `${used} / ${limit}`;
  }

  visibleAdmins(): AdminCompanyContact[] {
    const admins = this.detail ? this.detail.admins : [];
    return this.showAllAdmins ? admins : admins.slice(0, 5);
  }

  hiddenAdminCount(): number {
    const total = this.detail ? this.detail.admins.length : 0;
    return this.showAllAdmins ? 0 : Math.max(0, total - 5);
  }

  visiblePayments(): AdminPaymentRow[] {
    const rows = this.detail ? this.detail.payments : [];
    if (!this.paymentRange || this.paymentRange.invalid) {
      return this.paymentRange && this.paymentRange.invalid ? [] : rows;
    }
    return rows.filter(row => {
      const day = (row.paidAt || '').slice(0, 10);
      return day >= this.paymentRange.from && day <= this.paymentRange.to;
    });
  }

  trackPayment(_index: number, row: AdminPaymentRow): string {
    return row.paymentId || row.externalId;
  }

  trackEvent(index: number, row: AdminCompanyEvent): string {
    return `${row.at}-${row.kind}-${index}`;
  }

  private readTab(value: string | null): CompanyTab {
    if (value === 'subscription' || value === 'payments' || value === 'history') {
      return value;
    }
    return 'overview';
  }

  private readPaymentRange(params: ParamMap): AdminTimeRange | null {
    const range = (params.get('payRange') || '').trim().toLowerCase();
    const from = (params.get('payFrom') || '').trim();
    const to = (params.get('payTo') || '').trim();
    if (!range && !from && !to) {
      return null;
    }
    if (range === 'today' || range === '7d' || range === '30d') {
      return resolvePreset(range);
    }
    return {
      preset: 'custom',
      from,
      to,
      invalid: validateCustomRange(from, to),
    };
  }

  private fetch(): void {
    if (this.detailSub) {
      this.detailSub.unsubscribe();
    }
    const seq = ++this.fetchSeq;
    this.loading = true;
    this.error = '';
    this.detailSub = this.adminService.getCompanyDetail(this.companyId).pipe(takeUntil(this.destroy$)).subscribe({
      next: result => {
        if (seq !== this.fetchSeq) {
          return;
        }
        this.loading = false;
        this.detail = result;
      },
      error: err => {
        if (seq !== this.fetchSeq) {
          return;
        }
        this.loading = false;
        this.detail = null;
        const missing = err && (err.status === 404 || (err.message && String(err.message).indexOf('not in the response') !== -1));
        this.error = missing ? 'Company not found' : readHttpError(err, 'Could not load this company.');
      }
    });
  }
}
