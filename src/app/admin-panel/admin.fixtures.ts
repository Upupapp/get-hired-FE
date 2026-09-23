/**
 * Local admin fixtures for the screens-first pass.
 *
 * Clarence (get-hired-BE) replaces these when the live endpoints grow.
 * Live responses always win field-by-field. Fixtures fill only what the
 * response left out, or the whole screen when the call fails (not on 401/403).
 *
 * Suggested live shapes:
 *   GET /admin/dashboard?range=today|7d|30d|custom&from=&to=
 *     existing inventory KPIs
 *     + visits_total, visits_previous, visits_series[{date,count}], visits_metric_label
 *     + applications_in_range
 *   GET /admin/applications?q=&from=&to=&page=&pageSize=
 *     { items, total, page, pageSize }
 *
 * Gaps while this flag stays on:
 * - Site visits are pageview fixtures, labeled "Pageviews (fixture)". There is no admin analytics API.
 * - applications_in_range falls back to applications_7d / applications_30d when the preset matches,
 *   otherwise to the fixture catalog. Today and custom need the new field.
 * - GET /admin/applications does not exist yet. The ops list is fixture-only until it does.
 * - Job status words are mapped to job_status_id 1–4 before the jobs request.
 * - Users last_login is shown as — when the list omits it (the column is not on the BE list today).
 * - Full-dashboard fixture mode (HTTP failure) also invents inventory totals. The screen says so.
 */
import {
  AdminApplicationQuery,
  AdminApplicationRow,
  AdminCompanyRow,
  AdminJobQuery,
  AdminJobRow,
  AdminListQuery,
  AdminPage,
  AdminUserQuery,
  AdminUserRow,
  Dashboard,
  VisitPoint,
} from './admin.model';
import { addDays, eachDay, manilaYmd, previousWindow, AdminTimeRange } from './admin-time';
import { jobStatusLabel, jobStatusQueryValue } from './admin.normalize';

export const ADMIN_USE_FIXTURES = true;
export const FIXTURE_VISITS_LABEL = 'Pageviews (fixture)';
export const VISITS_FOOTNOTE =
  'Visits = unique sessions or pageviews — label matches what BE provides (fixtures first).';

const SEEKERS: { name: string; email: string }[] = [
  { name: 'Ada Cruz', email: 'ada.cruz@example.com' },
  { name: 'Miguel Santos', email: 'miguel.santos@example.com' },
  { name: 'Priya Nair', email: 'priya.nair@example.com' },
  { name: 'Jonah Reyes', email: 'jonah.reyes@example.com' },
  { name: 'Liza Gomez', email: 'liza.gomez@example.com' },
  { name: 'Carlo Tan', email: 'carlo.tan@example.com' },
];

const JOBS: { id: string; title: string; company: string }[] = [
  { id: 'JB-1042', title: 'Kitchen Lead', company: "Lola's Table" },
  { id: 'JB-1108', title: 'Front Desk Associate', company: 'Harbor Inn' },
  { id: 'JB-0988', title: 'Warehouse Associate', company: 'Northline Logistics' },
  { id: 'JB-1214', title: 'Barista', company: 'Cupping Room' },
  { id: 'JB-0871', title: 'Retail Merchandiser', company: 'Bay & Co.' },
  { id: 'JB-1302', title: 'Delivery Rider', company: 'QuickCart' },
];

const APPLICATION_STATUSES = ['Submitted', 'Reviewed', 'Submitted', 'Interview', 'Withdrawn'];

const FIXTURE_USERS: AdminUserRow[] = [
  { uid: 'U-100', email: 'ada.cruz@example.com', role: 3, firstName: 'Ada', lastName: 'Cruz', createdAt: '2025-11-02', lastLogin: '2026-09-22T02:10:00+08:00' },
  { uid: 'U-101', email: 'miguel.santos@example.com', role: 2, firstName: 'Miguel', lastName: 'Santos', createdAt: '2026-01-14', lastLogin: null },
  { uid: 'U-102', email: 'priya.nair@example.com', role: 3, firstName: 'Priya', lastName: 'Nair', createdAt: '2026-03-09', lastLogin: '2026-09-20T11:04:00+08:00' },
  { uid: 'U-103', email: 'ops@gethired.example', role: 1, firstName: 'Ops', lastName: 'Admin', createdAt: '2025-06-01', lastLogin: '2026-09-23T08:40:00+08:00' },
];

const FIXTURE_JOB_ROWS: AdminJobRow[] = [
  { jobId: 'JB-1042', title: 'Kitchen Lead', companyName: "Lola's Table", status: 2, statusLabel: 'Published', createdAt: '2026-08-12', applicantCount: 14 },
  { jobId: 'JB-1108', title: 'Front Desk Associate', companyName: 'Harbor Inn', status: 2, statusLabel: 'Published', createdAt: '2026-09-01', applicantCount: 6 },
  { jobId: 'JB-0988', title: 'Warehouse Associate', companyName: 'Northline Logistics', status: 1, statusLabel: 'Draft', createdAt: '2026-09-18', applicantCount: 0 },
  { jobId: 'JB-0871', title: 'Retail Merchandiser', companyName: 'Bay & Co.', status: 3, statusLabel: 'Expired', createdAt: '2026-05-02', applicantCount: 21 },
  { jobId: 'JB-0704', title: 'Night Auditor', companyName: 'Harbor Inn', status: 4, statusLabel: 'Archived', createdAt: '2026-02-11', applicantCount: 9 },
  { jobId: 'JB-1302', title: 'Delivery Rider', companyName: 'QuickCart', status: 2, statusLabel: 'Published', createdAt: '2026-09-20', applicantCount: 3 },
];

const FIXTURE_COMPANIES: AdminCompanyRow[] = [
  { companyId: 'CO-20', companyName: "Lola's Table", slug: 'lolas-table', openJobsCount: 2, createdAt: '2025-04-18' },
  { companyId: 'CO-21', companyName: 'Harbor Inn', slug: 'harbor-inn', openJobsCount: 1, createdAt: '2025-08-03' },
  { companyId: 'CO-22', companyName: 'Northline Logistics', slug: 'northline', openJobsCount: 4, createdAt: '2026-01-22' },
  { companyId: 'CO-23', companyName: 'Cupping Room', slug: 'cupping-room', openJobsCount: 1, createdAt: '2026-06-15' },
];

export function fixtureApplicationCatalog(now = new Date()): AdminApplicationRow[] {
  const today = manilaYmd(now);
  const rows: AdminApplicationRow[] = [];
  for (let index = 0; index < 40; index++) {
    const day = addDays(today, -(index % 45));
    const seeker = SEEKERS[index % SEEKERS.length];
    const job = JOBS[index % JOBS.length];
    rows.push({
      applicationId: `AP-${2400 + index}`,
      dateApplied: `${day}T09:${String(index % 50).padStart(2, '0')}:00+08:00`,
      seekerName: seeker.name,
      seekerEmail: seeker.email,
      jobId: job.id,
      jobTitle: job.title,
      companyName: job.company,
      status: APPLICATION_STATUSES[index % APPLICATION_STATUSES.length],
    });
  }
  return rows.sort((a, b) => String(b.dateApplied).localeCompare(String(a.dateApplied)));
}

export function fixtureApplications(query: AdminApplicationQuery, now = new Date()): AdminPage<AdminApplicationRow> {
  const q = (query.q || '').trim().toLowerCase();
  const filtered = fixtureApplicationCatalog(now).filter(row => {
    const day = (row.dateApplied || '').slice(0, 10);
    if (query.from && day < query.from) {
      return false;
    }
    if (query.to && day > query.to) {
      return false;
    }
    if (!q) {
      return true;
    }
    const haystack = `${row.seekerName} ${row.seekerEmail} ${row.jobTitle} ${row.companyName}`.toLowerCase();
    return haystack.indexOf(q) !== -1;
  });
  return pageOf(filtered, query.page, query.pageSize);
}

export function fixtureDashboard(range: AdminTimeRange, now = new Date()): Dashboard {
  const today = manilaYmd(now);
  const from = range.from || today;
  const to = range.to || today;
  const series = eachDay(from, to).map(date => ({
    date,
    count: date > today ? 0 : dailyPageviews(date),
  }));
  const previous = previousWindow(from, to);
  const previousSeries = eachDay(previous.from, previous.to).map(date => ({
    date,
    count: date > today ? 0 : dailyPageviews(date),
  }));
  const inRange = fixtureApplications({ q: '', from, to, page: 1, pageSize: 1 }, now).total;
  const last7 = fixtureApplications({
    q: '',
    from: addDays(today, -6),
    to: today,
    page: 1,
    pageSize: 1,
  }, now).total;
  const last30 = fixtureApplications({
    q: '',
    from: addDays(today, -29),
    to: today,
    page: 1,
    pageSize: 1,
  }, now).total;

  return {
    usersTotal: 1284,
    jobseekersTotal: 980,
    employersTotal: 276,
    adminsTotal: 28,
    jobsActive: 146,
    jobsTotal: 312,
    applications7d: last7,
    applications30d: last30,
    companiesTotal: 94,
    range: range.preset,
    from,
    to,
    visitsTotal: sumCounts(series),
    visitsPrevious: sumCounts(previousSeries),
    visitsSeries: series,
    visitsMetricLabel: FIXTURE_VISITS_LABEL,
    applicationsInRange: inRange,
    applicationsInRangeFixture: true,
    fixtureMode: 'fixture',
  };
}

/**
 * Keep live inventory. Fill visits and in-range applications only when the payload omitted them.
 * A null live dashboard becomes the full fixture when fixtures are enabled.
 */
export function applyDashboardFixture(
  live: Dashboard | null,
  range: AdminTimeRange,
  now = new Date()
): Dashboard | null {
  const fixture = fixtureDashboard(range, now);
  if (!live) {
    return ADMIN_USE_FIXTURES ? fixture : null;
  }

  const series = live.visitsSeries || [];
  const liveVisits = live.visitsTotal != null
    ? live.visitsTotal
    : (series.length ? sumCounts(series) : null);
  const visitsFromLive = liveVisits != null;
  const usedVisitFixture = !visitsFromLive && ADMIN_USE_FIXTURES;

  let applicationsInRange = live.applicationsInRange;
  let applicationsInRangeFixture = false;
  if (applicationsInRange == null && range.preset === '7d' && live.applications7d != null) {
    applicationsInRange = live.applications7d;
  } else if (applicationsInRange == null && range.preset === '30d' && live.applications30d != null) {
    applicationsInRange = live.applications30d;
  } else if (applicationsInRange == null && ADMIN_USE_FIXTURES) {
    applicationsInRange = fixture.applicationsInRange;
    applicationsInRangeFixture = true;
  }

  const fixtureMode: Dashboard['fixtureMode'] =
    usedVisitFixture || applicationsInRangeFixture ? 'mixed' : 'live';

  return {
    ...live,
    range: range.preset,
    from: range.from || live.from,
    to: range.to || live.to,
    visitsTotal: visitsFromLive ? liveVisits : (usedVisitFixture ? fixture.visitsTotal : null),
    visitsPrevious: live.visitsPrevious != null ? live.visitsPrevious : (usedVisitFixture ? fixture.visitsPrevious : null),
    visitsSeries: series.length ? series : (usedVisitFixture ? fixture.visitsSeries : []),
    visitsMetricLabel: live.visitsMetricLabel || (usedVisitFixture ? FIXTURE_VISITS_LABEL : null),
    applicationsInRange,
    applicationsInRangeFixture,
    fixtureMode,
  };
}

export function fixtureUsers(query: AdminUserQuery): AdminPage<AdminUserRow> {
  const q = (query.q || '').trim().toLowerCase();
  const filtered = FIXTURE_USERS.filter(row => {
    if (query.role && String(row.role) !== String(query.role)) {
      return false;
    }
    if (!q) {
      return true;
    }
    const haystack = `${row.firstName} ${row.lastName} ${row.email}`.toLowerCase();
    return haystack.indexOf(q) !== -1;
  });
  return pageOf(filtered, query.page, query.pageSize);
}

export function fixtureJobs(query: AdminJobQuery): AdminPage<AdminJobRow> {
  const wanted = jobStatusQueryValue(query.status);
  const q = (query.q || '').trim().toLowerCase();
  const filtered = FIXTURE_JOB_ROWS.filter(row => {
    if (wanted != null && Number(row.status) !== Number(wanted)) {
      return false;
    }
    if (!q) {
      return true;
    }
    const haystack = `${row.title} ${row.companyName}`.toLowerCase();
    return haystack.indexOf(q) !== -1;
  }).map(row => ({
    ...row,
    statusLabel: row.statusLabel || jobStatusLabel(row.status),
  }));
  return pageOf(filtered, query.page, query.pageSize);
}

export function fixtureCompanies(query: AdminListQuery): AdminPage<AdminCompanyRow> {
  const q = (query.q || '').trim().toLowerCase();
  const filtered = FIXTURE_COMPANIES.filter(row => {
    if (!q) {
      return true;
    }
    return `${row.companyName} ${row.slug}`.toLowerCase().indexOf(q) !== -1;
  });
  return pageOf(filtered, query.page, query.pageSize);
}

function pageOf<T>(items: T[], page: number, pageSize: number): AdminPage<T> {
  const size = pageSize > 0 ? pageSize : 25;
  const current = page > 0 ? page : 1;
  const start = (current - 1) * size;
  return {
    items: items.slice(start, start + size),
    total: items.length,
    page: current,
    pageSize: size,
    fromFixture: true,
  };
}

function dailyPageviews(ymd: string): number {
  let hash = 2166136261;
  for (let index = 0; index < ymd.length; index++) {
    hash ^= ymd.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return 80 + (hash >>> 0) % 400;
}

function sumCounts(series: VisitPoint[]): number {
  return series.reduce((total, point) => total + point.count, 0);
}
