import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, takeUntil } from 'rxjs/operators';
import { AdminTimeRange, rangeKey, readTimeQuery, resolvePreset, timeQueryParams } from '../admin-time';
import { AdminJobAlertRow, JobAlertFixtureShot } from '../admin.model';
import { AdminService } from '../admin.service';
import {
  formatAdminManilaDateTime,
  formatAdminManilaDay,
  isSeekerRole,
  jobAlertStatusClass,
  jobAlertStatusLabel,
  readHttpError,
  readPage,
  roleLabel,
} from '../admin.normalize';

type JobAlertStatus = 'active' | 'inactive' | 'all';

@Component({
  selector: 'app-admin-job-alerts',
  templateUrl: './admin-job-alerts.component.html',
  styleUrls: ['./admin-job-alerts.component.scss']
})
export class AdminJobAlertsComponent implements OnInit, OnDestroy {
  readonly pageSize = 25;
  readonly statusChips: { value: JobAlertStatus; label: string }[] = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'all', label: 'All' },
  ];
  readonly loadingText = 'Loading Job Alerts…';
  readonly emptyActiveText = 'No active Job Alert subscriptions in this range.';
  readonly emptyOtherText = 'No Job Alert subscriptions in this range.';
  readonly unavailableText = 'Job Alert subscriptions aren\u2019t available yet.';
  readonly detailEmptyTextDefault = 'No Job Alert subscriptions for this seeker.';

  rows: AdminJobAlertRow[] = [];
  total = 0;
  page = 1;
  searchText = '';
  range: AdminTimeRange = resolvePreset('7d');
  status: JobAlertStatus = 'active';
  selectedUid: string | null = null;
  detail: {
    userUid: string;
    seekerName: string;
    seekerEmail: string;
    seekerRole: number | string | null;
    seekerArchived: boolean;
    activeCount: number;
    totalCount: number;
    subscriptions: AdminJobAlertRow[];
    joaAvailable: boolean;
  } | null = null;
  loading = false;
  error = '';
  detailLoading = false;
  detailError = '';
  fromFixture = false;
  joaAvailable = true;

  private q = '';
  private fixtureShot: JobAlertFixtureShot | null = null;
  private loadedKey = '';
  private loadedUser: string | null | undefined = undefined;
  private fetchSeq = 0;
  private detailSeq = 0;
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
      this.status = state.status;
      this.fixtureShot = state.shot;
      const key = `${state.q}|${state.page}|${rangeKey(state.range)}|${state.status}|${state.shot || ''}`;
      if (state.range.invalid) {
        this.loading = false;
        this.rows = [];
        this.total = 0;
        this.joaAvailable = true;
        this.loadedKey = key;
      } else if (key !== this.loadedKey) {
        this.loadedKey = key;
        this.fetch();
      }
      if (state.user !== this.loadedUser) {
        this.loadedUser = state.user;
        this.selectedUid = state.user;
        this.loadDetail(state.user);
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

  onStatus(status: JobAlertStatus): void {
    if (status === this.status) {
      return;
    }
    this.status = status;
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

  openSeeker(row: AdminJobAlertRow): void {
    if (!row.userUid || row.userUid === this.selectedUid) {
      return;
    }
    this.selectedUid = row.userUid;
    this.pushQuery();
  }

  closeDetail(): void {
    this.selectedUid = null;
    this.detail = null;
    this.detailError = '';
    this.detailLoading = false;
    this.pushQuery();
  }

  retry(): void {
    this.fetch();
  }

  retryDetail(): void {
    this.loadDetail(this.selectedUid);
  }

  when(value: string | null): string {
    return formatAdminManilaDay(value);
  }

  whenSent(value: string | null): string {
    return formatAdminManilaDateTime(value);
  }

  roleOf(role: number | string | null): string {
    return roleLabel(role);
  }

  statusLabel(active: boolean): string {
    return jobAlertStatusLabel(active);
  }

  statusClass(active: boolean): string {
    return jobAlertStatusClass(active);
  }

  showNonSeeker(role: number | string | null): boolean {
    if (role == null || role === '') {
      return false;
    }
    return !isSeekerRole(role);
  }

  normalizedDiffers(row: AdminJobAlertRow): boolean {
    const normalized = (row.positionNormalized || '').trim();
    if (!normalized) {
      return false;
    }
    return normalized !== (row.position || '').trim();
  }

  jobsSuffix(count: number | null): string | null {
    if (count == null || count <= 0) {
      return null;
    }
    const noun = count === 1 ? 'job' : 'jobs';
    return `\u00b7 ${count} ${noun}`;
  }

  showLease(row: AdminJobAlertRow): boolean {
    return !row.instantSentAt && !!row.instantClaimedAt;
  }

  copyId(value: string): void {
    const clipboard = navigator && navigator.clipboard;
    if (clipboard && clipboard.writeText) {
      clipboard.writeText(value).catch(() => undefined);
    }
  }

  trackRow(_index: number, row: AdminJobAlertRow): string {
    return row.id || `${row.userUid}-${row.position}`;
  }

  get emptyText(): string {
    return this.status === 'active' ? this.emptyActiveText : this.emptyOtherText;
  }

  get detailIsEmpty(): boolean {
    return !this.detailLoading && !this.detailError && (!this.detail || this.detail.subscriptions.length === 0);
  }

  get detailEmptyText(): string {
    if (this.detail && !this.detail.joaAvailable) {
      return this.unavailableText;
    }
    return this.detailEmptyTextDefault;
  }

  get showUnavailable(): boolean {
    return !this.loading && !this.error && !this.range.invalid && !this.joaAvailable;
  }

  get showEmpty(): boolean {
    return !this.loading && !this.error && !this.range.invalid && this.joaAvailable && this.rows.length === 0;
  }

  get showTable(): boolean {
    return !this.loading && !this.error && this.joaAvailable && this.rows.length > 0;
  }

  get showFixtureNote(): boolean {
    return this.fromFixture && this.joaAvailable && !this.loading && !this.error;
  }

  get detailSubscriptions(): AdminJobAlertRow[] {
    if (!this.detail) {
      return [];
    }
    return this.detail.subscriptions.slice().sort((a, b) => {
      return String(b.createdAt).localeCompare(String(a.createdAt)) || String(b.id).localeCompare(String(a.id));
    });
  }

  get showDetailTable(): boolean {
    return !!this.detail && this.detail.joaAvailable && !this.detailLoading && !this.detailError && this.detailSubscriptions.length > 0;
  }

  get headerName(): string {
    if (this.detail && this.detail.seekerName) {
      return this.detail.seekerName;
    }
    const row = this.selectedListRow;
    return row && row.seekerName ? row.seekerName : 'Seeker';
  }

  get headerEmail(): string {
    if (this.detail && this.detail.seekerEmail) {
      return this.detail.seekerEmail;
    }
    const row = this.selectedListRow;
    return row ? row.seekerEmail : '';
  }

  get headerRole(): number | string | null {
    if (this.detail) {
      return this.detail.seekerRole;
    }
    const row = this.selectedListRow;
    return row ? row.seekerRole : null;
  }

  get headerRoleLabel(): string {
    if (this.headerRole == null || this.headerRole === '') {
      return '';
    }
    const label = roleLabel(this.headerRole);
    return label === '—' ? '' : label;
  }

  get headerArchived(): boolean {
    if (this.detail) {
      return this.detail.seekerArchived;
    }
    const row = this.selectedListRow;
    return !!row && row.seekerArchived;
  }

  private get selectedListRow(): AdminJobAlertRow | null {
    return this.rows.find(row => row.userUid === this.selectedUid) || null;
  }

  private paramKey(params: ParamMap): string {
    return [
      params.get('q') || '',
      params.get('page') || '',
      params.get('range') || '',
      params.get('from') || '',
      params.get('to') || '',
      params.get('status') || '',
      params.get('user') || '',
      params.get('shot') || '',
    ].join('|');
  }

  private readParams(params: ParamMap): {
    q: string;
    page: number;
    range: AdminTimeRange;
    status: JobAlertStatus;
    user: string | null;
    shot: JobAlertFixtureShot | null;
  } {
    return {
      q: params.get('q') || '',
      page: readPage(params.get('page')),
      range: readTimeQuery(params),
      status: this.readStatus(params.get('status')),
      user: params.get('user'),
      shot: this.readShot(params.get('shot')),
    };
  }

  private readStatus(value: string | null): JobAlertStatus {
    const text = (value || '').trim().toLowerCase();
    if (text === 'inactive' || text === 'false') {
      return 'inactive';
    }
    if (text === 'all') {
      return 'all';
    }
    return 'active';
  }

  private readShot(value: string | null): JobAlertFixtureShot | null {
    const text = (value || '').trim().toLowerCase();
    if (text === 'empty' || text === 'unavailable') {
      return text;
    }
    return null;
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
        status: this.status === 'active' ? null : this.status,
        user: this.selectedUid || null,
        shot: this.fixtureShot || null,
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
    this.listSub = this.adminService.listJobOpeningAlerts({
      q: this.q,
      from: this.range.from,
      to: this.range.to,
      page: this.page,
      pageSize: this.pageSize,
      active: this.status === 'all' ? undefined : this.status === 'active',
      fixtureShot: this.fixtureShot,
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
        this.joaAvailable = result.joaAvailable !== false;
      },
      error: err => {
        if (seq !== this.fetchSeq) {
          return;
        }
        this.loading = false;
        this.rows = [];
        this.total = 0;
        this.fromFixture = false;
        this.joaAvailable = true;
        this.error = readHttpError(err, 'Could not load Job Alerts.');
      }
    });
  }

  private loadDetail(uid: string | null): void {
    this.detail = null;
    this.detailError = '';
    if (!uid) {
      this.detailLoading = false;
      return;
    }
    const seq = ++this.detailSeq;
    this.detailLoading = true;
    this.adminService.getJobOpeningAlertUser(uid, this.fixtureShot).pipe(takeUntil(this.destroy$)).subscribe({
      next: result => {
        if (seq !== this.detailSeq) {
          return;
        }
        this.detailLoading = false;
        this.detail = result;
      },
      error: err => {
        if (seq !== this.detailSeq) {
          return;
        }
        this.detailLoading = false;
        this.detailError = readHttpError(err, 'Could not load this seeker’s Job Alerts.');
      }
    });
  }
}
