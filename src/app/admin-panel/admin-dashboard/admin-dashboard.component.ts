import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { distinctUntilChanged, map, takeUntil } from 'rxjs/operators';
import {
  AdminTimeRange,
  formatVisitDelta,
  rangeKey,
  readTimeQuery,
  resolvePreset,
  sparklinePoints,
  timeQueryParams,
  visitDirection,
} from '../admin-time';
import { VISITS_FOOTNOTE } from '../admin.fixtures';
import { Dashboard } from '../admin.model';
import { formatAdminDay } from '../admin.normalize';
import { AdminFacade } from '../state/admin.facade';

interface DashboardCard {
  label: string;
  value: number | null;
  hint: string;
  link: string | null;
  query?: Record<string, string>;
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  readonly visitsFootnote = VISITS_FOOTNOTE;
  loading$ = this.adminFacade.dashboardLoading$;
  error$ = this.adminFacade.dashboardError$;
  dashboard$ = this.adminFacade.dashboard$;
  range: AdminTimeRange = resolvePreset('7d');

  private loadedKey = '';
  private destroy$ = new Subject<void>();

  constructor(
    private adminFacade: AdminFacade,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.pipe(
      map(params => `${params.get('range') || ''}|${params.get('from') || ''}|${params.get('to') || ''}`),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.range = readTimeQuery(this.route.snapshot.queryParamMap);
      if (this.range.invalid) {
        return;
      }
      const key = rangeKey(this.range);
      if (key === this.loadedKey) {
        return;
      }
      this.loadedKey = key;
      this.adminFacade.getAdminDashboard(this.range);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onRange(next: AdminTimeRange): void {
    this.range = next;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: timeQueryParams(next),
    });
  }

  retry(): void {
    if (this.range.invalid) {
      return;
    }
    this.loadedKey = '';
    this.adminFacade.getAdminDashboard(this.range);
  }

  cardsFor(dash: Dashboard): DashboardCard[] {
    return [
      { label: 'Users', value: dash.usersTotal, hint: 'All accounts', link: '/admin/users' },
      { label: 'Jobseekers', value: dash.jobseekersTotal, hint: 'Jobseeker accounts', link: '/admin/users', query: { role: '3' } },
      { label: 'Employers', value: dash.employersTotal, hint: 'Employer accounts', link: '/admin/users', query: { role: '2' } },
      { label: 'Admins', value: dash.adminsTotal, hint: 'Admin accounts', link: '/admin/users', query: { role: '1' } },
      { label: 'Active jobs', value: dash.jobsActive, hint: 'Published listings', link: '/admin/jobs', query: { status: 'published' } },
      { label: 'Jobs', value: dash.jobsTotal, hint: 'All listings', link: '/admin/jobs' },
      {
        label: 'Applications in range',
        value: dash.applicationsInRange,
        hint: dash.applicationsInRangeFixture ? 'Submitted in this range (fixture)' : 'Submitted in this range',
        link: '/admin/applications',
        query: this.linkQuery() || undefined,
      },
      { label: 'Companies', value: dash.companiesTotal, hint: 'Employer companies', link: '/admin/companies' },
    ];
  }

  day(value: string | null): string {
    return formatAdminDay(value);
  }

  delta(dash: Dashboard): string {
    return formatVisitDelta(dash.visitsTotal, dash.visitsPrevious);
  }

  direction(dash: Dashboard): string {
    return visitDirection(dash.visitsTotal, dash.visitsPrevious);
  }

  spark(dash: Dashboard): string {
    return sparklinePoints(dash.visitsSeries || []);
  }

  private linkQuery(): Record<string, string> | null {
    const params = timeQueryParams(this.range);
    const query: Record<string, string> = {};
    if (params.range) {
      query.range = params.range;
    }
    if (params.from) {
      query.from = params.from;
    }
    if (params.to) {
      query.to = params.to;
    }
    return Object.keys(query).length ? query : null;
  }
}
