import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, takeUntil } from 'rxjs/operators';
import { AdminCompanyRow } from '../admin.model';
import { AdminService } from '../admin.service';
import { formatAdminDate, readHttpError, readPage } from '../admin.normalize';

@Component({
  selector: 'app-admin-companies',
  templateUrl: './admin-companies.component.html',
  styleUrls: ['./admin-companies.component.scss']
})
export class AdminCompaniesComponent implements OnInit, OnDestroy {
  readonly pageSize = 25;

  rows: AdminCompanyRow[] = [];
  total = 0;
  page = 1;
  searchText = '';
  loading = false;
  error = '';

  private q = '';
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
      map(params => this.readParams(params)),
      distinctUntilChanged((a, b) => a.q === b.q && a.page === b.page),
      takeUntil(this.destroy$)
    ).subscribe(state => {
      this.q = state.q;
      this.searchText = state.q;
      this.page = state.page;
      const key = `${state.q}|${state.page}`;
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
    this.pushQuery();
  }

  goTo(page: number): void {
    if (page < 1 || page === this.page) {
      return;
    }
    this.page = page;
    this.pushQuery();
  }

  retry(): void {
    this.fetch();
  }

  when(value: string | null): string {
    return formatAdminDate(value);
  }

  count(value: number | null): string {
    return value == null ? '—' : String(value);
  }

  trackCompany(_index: number, row: AdminCompanyRow): string {
    return row.companyId || row.companyName;
  }

  private readParams(params: ParamMap): { q: string; page: number } {
    return {
      q: params.get('q') || '',
      page: readPage(params.get('page')),
    };
  }

  private pushQuery(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        q: this.searchText.trim() || null,
        page: this.page > 1 ? this.page : null,
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
    this.listSub = this.adminService.listCompanies({
      q: this.q,
      page: this.page,
      pageSize: this.pageSize,
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: result => {
        if (seq !== this.fetchSeq) {
          return;
        }
        this.loading = false;
        this.rows = result.items;
        this.total = result.total;
        this.page = result.page || this.page;
      },
      error: err => {
        if (seq !== this.fetchSeq) {
          return;
        }
        this.loading = false;
        this.rows = [];
        this.total = 0;
        this.error = readHttpError(err, 'Could not load companies.');
      }
    });
  }
}
