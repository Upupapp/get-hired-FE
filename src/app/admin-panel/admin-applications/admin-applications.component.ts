import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, takeUntil } from 'rxjs/operators';
import { AdminTimeRange, rangeKey, readTimeQuery, resolvePreset, timeQueryParams } from '../admin-time';
import { AdminApplicationRow } from '../admin.model';
import { AdminService } from '../admin.service';
import { formatAdminDay, readHttpError, readPage } from '../admin.normalize';

@Component({
  selector: 'app-admin-applications',
  templateUrl: './admin-applications.component.html',
  styleUrls: ['./admin-applications.component.scss']
})
export class AdminApplicationsComponent implements OnInit, OnDestroy {
  readonly pageSize = 25;

  rows: AdminApplicationRow[] = [];
  total = 0;
  page = 1;
  searchText = '';
  range: AdminTimeRange = resolvePreset('7d');
  loading = false;
  error = '';
  fromFixture = false;

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
      map(params => this.paramKey(params)),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      const state = this.readParams(this.route.snapshot.queryParamMap);
      this.q = state.q;
      this.searchText = state.q;
      this.page = state.page;
      this.range = state.range;
      if (state.range.invalid) {
        this.loading = false;
        this.rows = [];
        this.total = 0;
        return;
      }
      const key = `${state.q}|${state.page}|${rangeKey(state.range)}`;
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

  onRange(next: AdminTimeRange): void {
    this.range = next;
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
    return formatAdminDay(value);
  }

  trackApplication(_index: number, row: AdminApplicationRow): string {
    return row.applicationId || `${row.seekerEmail}-${row.jobId}`;
  }

  private paramKey(params: ParamMap): string {
    return [
      params.get('q') || '',
      params.get('page') || '',
      params.get('range') || '',
      params.get('from') || '',
      params.get('to') || '',
    ].join('|');
  }

  private readParams(params: ParamMap): { q: string; page: number; range: AdminTimeRange } {
    return {
      q: params.get('q') || '',
      page: readPage(params.get('page')),
      range: readTimeQuery(params),
    };
  }

  private pushQuery(): void {
    const time = timeQueryParams(this.range);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        q: this.searchText.trim() || null,
        page: this.page > 1 ? this.page : null,
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
    this.listSub = this.adminService.listApplications({
      q: this.q,
      from: this.range.from,
      to: this.range.to,
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
        this.fromFixture = !!result.fromFixture;
      },
      error: err => {
        if (seq !== this.fetchSeq) {
          return;
        }
        this.loading = false;
        this.rows = [];
        this.total = 0;
        this.fromFixture = false;
        this.error = readHttpError(err, 'Could not load applications.');
      }
    });
  }
}
