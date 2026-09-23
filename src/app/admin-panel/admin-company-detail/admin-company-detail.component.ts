import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { distinctUntilChanged, map, takeUntil } from 'rxjs/operators';
import { AdminCompanyDetail, AdminCompanyEvent, AdminPaymentRow } from '../admin.model';
import { AdminService } from '../admin.service';
import { formatAdminDay, formatAdminMoney, readHttpError } from '../admin.normalize';

@Component({
  selector: 'app-admin-company-detail',
  templateUrl: './admin-company-detail.component.html',
  styleUrls: ['./admin-company-detail.component.scss']
})
export class AdminCompanyDetailComponent implements OnInit, OnDestroy {
  detail: AdminCompanyDetail | null = null;
  companyId = '';
  loading = false;
  error = '';

  private loadedId = '';
  private fetchSeq = 0;
  private destroy$ = new Subject<void>();
  private detailSub: Subscription | null = null;

  constructor(
    private adminService: AdminService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(
      map(params => params.get('companyId') || ''),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(companyId => {
      this.companyId = companyId;
      if (!companyId) {
        this.detail = null;
        this.error = 'Choose a company from the directory.';
        return;
      }
      if (companyId !== this.loadedId) {
        this.loadedId = companyId;
        this.fetch();
      }
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

  money(value: number | null | undefined): string {
    return formatAdminMoney(value, 'PHP');
  }

  when(value: string | null): string {
    return formatAdminDay(value);
  }

  count(value: number | null): string {
    return value == null ? '—' : String(value);
  }

  trackPayment(_index: number, row: AdminPaymentRow): string {
    return row.paymentId || row.invoiceId;
  }

  trackEvent(index: number, row: AdminCompanyEvent): string {
    return `${row.at}-${row.kind}-${index}`;
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
        this.error = readHttpError(err, 'Could not load this company.');
      }
    });
  }
}
