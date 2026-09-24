import { AfterViewChecked, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, takeUntil } from 'rxjs/operators';
import { AdminJobRow } from '../admin.model';
import { AdminService } from '../admin.service';
import {
  JOB_STATUS_FILTERS,
  formatAdminDate,
  isPublishedStatus,
  jobStatusClass,
  readHttpError,
  readPage,
} from '../admin.normalize';

@Component({
  selector: 'app-admin-jobs',
  templateUrl: './admin-jobs.component.html',
  styleUrls: ['./admin-jobs.component.scss']
})
export class AdminJobsComponent implements OnInit, OnDestroy, AfterViewChecked {
  readonly statusFilters = JOB_STATUS_FILTERS;
  readonly pageSize = 25;

  rows: AdminJobRow[] = [];
  total = 0;
  page = 1;
  searchText = '';
  status = '';
  loading = false;
  error = '';
  notice = '';
  actionError = '';
  fromFixture = false;
  selectedId: string | null = null;
  pendingJob: AdminJobRow | null = null;
  unpublishingId: string | null = null;

  @ViewChild('cancelUnpublishButton') cancelUnpublishButton?: ElementRef<HTMLButtonElement>;
  private pendingCancelFocus = false;

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
      distinctUntilChanged((a, b) =>
        a.q === b.q && a.status === b.status && a.page === b.page && a.job === b.job
      ),
      takeUntil(this.destroy$)
    ).subscribe(state => {
      this.q = state.q;
      this.searchText = state.q;
      this.status = state.status;
      this.page = state.page;
      this.selectedId = state.job;
      const key = `${state.q}|${state.status}|${state.page}`;
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

  ngAfterViewChecked(): void {
    if (!this.pendingCancelFocus || !this.cancelUnpublishButton) {
      return;
    }
    this.pendingCancelFocus = false;
    this.cancelUnpublishButton.nativeElement.focus();
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

  onStatus(status: string): void {
    this.status = status;
    this.page = 1;
    this.pushQuery();
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

  openJob(row: AdminJobRow): void {
    if (!row.jobId) {
      return;
    }
    this.selectedId = row.jobId;
    this.pushQuery();
  }

  closeDetail(): void {
    this.selectedId = null;
    this.pushQuery();
  }

  askUnpublish(job: AdminJobRow): void {
    this.actionError = '';
    this.notice = '';
    this.pendingJob = job;
    this.pendingCancelFocus = true;
  }

  cancelUnpublish(): void {
    if (this.unpublishingId) {
      return;
    }
    this.pendingJob = null;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.pendingJob) {
      this.cancelUnpublish();
    }
  }

  confirmUnpublish(): void {
    const job = this.pendingJob;
    if (!job || !job.jobId || this.unpublishingId) {
      return;
    }
    this.unpublishingId = job.jobId;
    this.actionError = '';
    this.adminService.unpublishJob(job.jobId).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.unpublishingId = null;
        this.pendingJob = null;
        this.notice = `Unpublished ${job.title || 'job'}. It stays in the directory and is hidden from applicants.`;
        this.fetch();
      },
      error: err => {
        this.unpublishingId = null;
        this.actionError = readHttpError(err, 'Could not unpublish this job.');
      }
    });
  }

  canUnpublish(job: AdminJobRow): boolean {
    return !!job.jobId && isPublishedStatus(job.status);
  }

  statusClass(job: AdminJobRow): string {
    return jobStatusClass(job.status);
  }

  when(value: string | null): string {
    return formatAdminDate(value);
  }

  count(value: number | null): string {
    return value == null ? '—' : String(value);
  }

  trackJob(_index: number, row: AdminJobRow): string {
    return row.jobId || row.title;
  }

  get selectedJob(): AdminJobRow | null {
    return this.rows.find(row => row.jobId === this.selectedId) || null;
  }

  private readParams(params: ParamMap): { q: string; status: string; page: number; job: string | null } {
    return {
      q: params.get('q') || '',
      status: params.get('status') || '',
      page: readPage(params.get('page')),
      job: params.get('job'),
    };
  }

  private pushQuery(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        q: this.searchText.trim() || null,
        status: this.status || null,
        page: this.page > 1 ? this.page : null,
        job: this.selectedId || null,
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
    this.listSub = this.adminService.listJobs({
      q: this.q,
      status: this.status,
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
        this.error = readHttpError(err, 'Could not load jobs.');
      }
    });
  }
}
