import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, takeUntil } from 'rxjs/operators';
import { AdminUserRow, ProfileField } from '../admin.model';
import { AdminService } from '../admin.service';
import {
  USER_ROLE_FILTERS,
  displayPersonName,
  formatAdminDate,
  profileFields,
  readHttpError,
  readPage,
  roleLabel,
  unwrapAdminBody,
} from '../admin.normalize';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss']
})
export class AdminUsersComponent implements OnInit, OnDestroy {
  readonly roleFilters = USER_ROLE_FILTERS;
  readonly pageSize = 25;

  rows: AdminUserRow[] = [];
  total = 0;
  page = 1;
  searchText = '';
  role = '';
  selectedId: string | null = null;
  profile: any = null;
  loading = false;
  error = '';
  profileLoading = false;
  profileError = '';
  fromFixture = false;

  private q = '';
  private loadedKey = '';
  private loadedProfileId: string | null | undefined = undefined;
  private fetchSeq = 0;
  private profileSeq = 0;
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
        a.q === b.q && a.role === b.role && a.page === b.page && a.id === b.id
      ),
      takeUntil(this.destroy$)
    ).subscribe(state => {
      this.q = state.q;
      this.searchText = state.q;
      this.role = state.role;
      this.page = state.page;
      const key = `${state.q}|${state.role}|${state.page}`;
      if (key !== this.loadedKey) {
        this.loadedKey = key;
        this.fetch();
      }
      if (state.id !== this.loadedProfileId) {
        this.loadedProfileId = state.id;
        this.selectedId = state.id;
        this.loadProfile(state.id);
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

  onRole(role: string): void {
    this.role = role;
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

  openUser(row: AdminUserRow): void {
    if (!row.uid) {
      return;
    }
    this.selectedId = row.uid;
    this.pushQuery();
  }

  closeDetail(): void {
    this.selectedId = null;
    this.profile = null;
    this.profileError = '';
    this.pushQuery();
  }

  retry(): void {
    this.fetch();
  }

  retryProfile(): void {
    this.loadProfile(this.selectedId);
  }

  nameOf(row: AdminUserRow): string {
    return displayPersonName(row);
  }

  roleOf(role: number | string | null): string {
    return roleLabel(role);
  }

  when(value: string | null): string {
    return formatAdminDate(value);
  }

  get detailFields(): ProfileField[] {
    return profileFields(this.profile);
  }

  get selectedRow(): AdminUserRow | null {
    return this.rows.find(row => row.uid === this.selectedId) || null;
  }

  trackUser(_index: number, row: AdminUserRow): string {
    return row.uid || row.email;
  }

  private readParams(params: ParamMap): { q: string; role: string; page: number; id: string | null } {
    return {
      q: params.get('q') || '',
      role: params.get('role') || '',
      page: readPage(params.get('page')),
      id: params.get('id'),
    };
  }

  private pushQuery(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        q: this.searchText.trim() || null,
        role: this.role || null,
        page: this.page > 1 ? this.page : null,
        id: this.selectedId || null,
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
    this.listSub = this.adminService.listUsers({
      q: this.q,
      role: this.role,
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
        this.error = readHttpError(err, 'Could not load users.');
      }
    });
  }

  private loadProfile(id: string | null): void {
    this.profile = null;
    this.profileError = '';
    if (!id) {
      this.profileLoading = false;
      return;
    }
    const seq = ++this.profileSeq;
    this.profileLoading = true;
    this.adminService.userProfile(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: res => {
        if (seq !== this.profileSeq) {
          return;
        }
        this.profileLoading = false;
        this.profile = unwrapAdminBody(res);
      },
      error: err => {
        if (seq !== this.profileSeq) {
          return;
        }
        this.profileLoading = false;
        this.profileError = readHttpError(err, 'Could not load this user.');
      }
    });
  }
}
