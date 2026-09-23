export interface Admin {

}

/** One day of the site-visits sparkline. */
export interface VisitPoint {
  date: string;
  count: number;
}

/**
 * KPI payload from GET /admin/dashboard.
 * Null means the field was absent.
 * Inventory totals are lifetime. Visits and applicationsInRange follow the time filter.
 * fixtureMode `fixture` means the whole payload is local sample data;
 * `mixed` means inventory is live and visits or in-range applications were filled in.
 */
export interface Dashboard {
  usersTotal: number | null;
  jobseekersTotal: number | null;
  employersTotal: number | null;
  adminsTotal: number | null;
  jobsActive: number | null;
  jobsTotal: number | null;
  applications7d: number | null;
  applications30d: number | null;
  companiesTotal: number | null;
  range: string | null;
  from: string | null;
  to: string | null;
  visitsTotal: number | null;
  visitsPrevious: number | null;
  visitsSeries: VisitPoint[];
  visitsMetricLabel: string | null;
  applicationsInRange: number | null;
  applicationsInRangeFixture: boolean;
  fixtureMode: 'live' | 'mixed' | 'fixture';
}

export interface User {

}

export interface AdminPage<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  /** True when the page was served from local fixtures after the live call failed. */
  fromFixture?: boolean;
}

export interface AdminUserRow {
  uid: string;
  email: string;
  role: number | string | null;
  firstName: string;
  lastName: string;
  createdAt: string | null;
  lastLogin: string | null;
}

export interface AdminJobRow {
  jobId: string;
  title: string;
  companyName: string;
  status: string | number | null;
  statusLabel: string;
  createdAt: string | null;
  applicantCount: number | null;
}

export interface AdminCompanyRow {
  companyId: string;
  companyName: string;
  slug: string;
  openJobsCount: number | null;
  createdAt: string | null;
}

export interface ProfileField {
  label: string;
  value: string;
}

export interface AdminListQuery {
  q?: string;
  page: number;
  pageSize: number;
}

export interface AdminUserQuery extends AdminListQuery {
  role?: string;
}

export interface AdminJobQuery extends AdminListQuery {
  status?: string;
}

export interface AdminApplicationQuery extends AdminListQuery {
  from?: string;
  to?: string;
}

export interface AdminApplicationRow {
  applicationId: string;
  dateApplied: string | null;
  seekerName: string;
  seekerEmail: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  status: string | null;
}
