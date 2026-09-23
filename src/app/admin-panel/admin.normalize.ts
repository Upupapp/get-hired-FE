import {
  AdminApplicationRow,
  AdminCompanyRow,
  AdminJobRow,
  AdminPage,
  AdminUserRow,
  Dashboard,
  ProfileField,
  VisitPoint,
} from './admin.model';

const SENSITIVE_KEY = /password|token|secret|hash|salt|otp|credential/i;

export const USER_ROLE_FILTERS: { value: string; label: string }[] = [
  { value: '', label: 'All roles' },
  { value: '1', label: 'Admin' },
  { value: '2', label: 'Employer' },
  { value: '3', label: 'Jobseeker' },
];

export const JOB_STATUS_FILTERS: { value: string; label: string }[] = [
  { value: '', label: 'All statuses' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
  { value: 'expired', label: 'Expired' },
  { value: 'archived', label: 'Archived' },
];

/**
 * UI filters stay words. Live BE `parseListQuery` expects job_status_id.
 * draft 1, published 2, expired 3, archived 4.
 */
export function jobStatusQueryValue(status: string | number | null | undefined): number | string | undefined {
  if (status == null) {
    return undefined;
  }
  const text = String(status).trim().toLowerCase();
  if (!text) {
    return undefined;
  }
  const ids: Record<string, number> = {
    draft: 1,
    published: 2,
    expired: 3,
    archived: 4,
  };
  if (ids[text] != null) {
    return ids[text];
  }
  if (text === '1' || text === '2' || text === '3' || text === '4') {
    return Number(text);
  }
  return text;
}

/** Existing admin calls return `{ data }`. A bare payload is accepted too. */
export function unwrapAdminBody(res: any): any {
  if (res && typeof res === 'object' && !Array.isArray(res) && Object.prototype.hasOwnProperty.call(res, 'data')) {
    return res.data;
  }
  return res;
}

export function buildAdminQuery(params: Record<string, string | number | null | undefined>): string {
  const parts: string[] = [];
  Object.keys(params).forEach(key => {
    const value = params[key];
    if (value === undefined || value === null || value === '') {
      return;
    }
    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
  });
  return parts.length ? `?${parts.join('&')}` : '';
}

export function readHttpError(err: any, fallback: string): string {
  const body = err && err.error;
  if (typeof body === 'string' && body.trim()) {
    return body.trim();
  }
  if (body && typeof body.message === 'string' && body.message.trim()) {
    return body.message.trim();
  }
  if (body && typeof body.error === 'string' && body.error.trim()) {
    return body.error.trim();
  }
  if (body && body.error && typeof body.error.message === 'string' && body.error.message.trim()) {
    return body.error.message.trim();
  }
  if (body && body.error && typeof body.error.error === 'string' && body.error.error.trim()) {
    return body.error.error.trim();
  }
  if (err && err.status === 0) {
    return 'Could not reach the server.';
  }
  return fallback;
}

export function readPage(value: string | null): number {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

export function roleLabel(role: number | string | null | undefined): string {
  const text = role == null ? '' : String(role).trim().toLowerCase();
  if (text === '1' || text === 'admin') {
    return 'Admin';
  }
  if (text === '2' || text === 'employer' || text === 'recruiter') {
    return 'Employer';
  }
  if (text === '3' || text === 'jobseeker' || text === 'applicant' || text === 'candidate') {
    return 'Jobseeker';
  }
  return text ? String(role) : '—';
}

export function isPublishedStatus(status: string | number | null | undefined): boolean {
  const text = status == null ? '' : String(status).trim().toLowerCase();
  return text === '2' || text === 'published' || text === 'active' || text === 'live';
}

export function jobStatusLabel(status: string | number | null | undefined): string {
  const text = status == null ? '' : String(status).trim().toLowerCase();
  const labels: Record<string, string> = {
    '1': 'Draft',
    draft: 'Draft',
    '2': 'Published',
    published: 'Published',
    active: 'Published',
    live: 'Published',
    '3': 'Expired',
    expired: 'Expired',
    '4': 'Archived',
    archived: 'Archived',
    unpublished: 'Unpublished',
    inactive: 'Unpublished',
    hidden: 'Hidden',
  };
  return labels[text] || (text ? String(status) : '—');
}

export function jobStatusClass(status: string | number | null | undefined): string {
  const label = jobStatusLabel(status).toLowerCase();
  if (label === 'published') {
    return 'admin-badge admin-badge--published';
  }
  if (label === 'expired' || label === 'archived' || label === 'unpublished' || label === 'hidden') {
    return 'admin-badge admin-badge--closed';
  }
  return 'admin-badge';
}

export function displayPersonName(row: { firstName?: string; lastName?: string; email?: string; uid?: string }): string {
  const name = `${row.firstName || ''} ${row.lastName || ''}`.trim();
  return name || row.email || row.uid || 'User';
}

export function formatAdminDate(value: string | null | undefined): string {
  if (!value) {
    return '—';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

const ADMIN_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Format a YYYY-MM-DD (or ISO prefix) without shifting the calendar day across timezones. */
export function formatAdminDay(value: string | null | undefined): string {
  if (!value) {
    return '—';
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) {
    return formatAdminDate(value);
  }
  const month = ADMIN_MONTHS[Number(match[2]) - 1];
  if (!month) {
    return value;
  }
  return `${month} ${Number(match[3])}, ${match[1]}`;
}

export function normalizeDashboard(res: any): Dashboard | null {
  const body = unwrapAdminBody(res);
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return null;
  }
  const dashboard: Dashboard = {
    usersTotal: readMetric(body, 'users_total', 'usersTotal'),
    jobseekersTotal: readMetric(body, 'jobseekers_total', 'jobseekersTotal'),
    employersTotal: readMetric(body, 'employers_total', 'employersTotal'),
    adminsTotal: readMetric(body, 'admins_total', 'adminsTotal'),
    jobsActive: readMetric(body, 'jobs_active', 'jobsActive'),
    jobsTotal: readMetric(body, 'jobs_total', 'jobsTotal'),
    applications7d: readMetric(body, 'applications_7d', 'applications7d'),
    applications30d: readMetric(body, 'applications_30d', 'applications30d'),
    companiesTotal: readMetric(body, 'companies_total', 'companiesTotal'),
    range: readOptionalText(body.range),
    from: readOptionalText(body.from),
    to: readOptionalText(body.to),
    visitsTotal: readMetric(body, 'visits_total', 'visitsTotal'),
    visitsPrevious: readMetric(body, 'visits_previous', 'visitsPrevious'),
    visitsSeries: readVisitSeries(body.visits_series != null ? body.visits_series : body.visitsSeries),
    visitsMetricLabel: readOptionalText(
      body.visits_metric_label != null ? body.visits_metric_label : body.visitsMetricLabel
    ),
    applicationsInRange: readMetric(body, 'applications_in_range', 'applicationsInRange'),
    applicationsInRangeFixture: false,
    fixtureMode: 'live',
  };
  const hasMetric = [
    dashboard.usersTotal,
    dashboard.jobseekersTotal,
    dashboard.employersTotal,
    dashboard.adminsTotal,
    dashboard.jobsActive,
    dashboard.jobsTotal,
    dashboard.applications7d,
    dashboard.applications30d,
    dashboard.companiesTotal,
    dashboard.visitsTotal,
    dashboard.visitsPrevious,
    dashboard.applicationsInRange,
  ].some(value => value !== null) || dashboard.visitsSeries.length > 0;
  return hasMetric ? dashboard : null;
}

export function normalizeUser(row: any): AdminUserRow {
  const source = row || {};
  return {
    uid: readText(source.uid ?? source.userId ?? source.user_id ?? source.id),
    email: readText(source.email),
    role: source.role ?? source.role_id ?? source.roleId ?? null,
    firstName: readText(source.first_name ?? source.firstName),
    lastName: readText(source.last_name ?? source.lastName),
    createdAt: readOptionalText(source.created_at ?? source.createdAt),
    lastLogin: readOptionalText(source.last_login ?? source.lastLogin),
  };
}

export function normalizeJob(row: any): AdminJobRow {
  const source = row || {};
  const status = source.status ?? source.job_status_id ?? source.jobStatusId ?? null;
  return {
    jobId: readText(source.job_id ?? source.jobId ?? source.id),
    title: readText(source.title ?? source.job_title ?? source.jobTitle),
    companyName: readText(source.company_name ?? source.companyName),
    status,
    statusLabel: jobStatusLabel(status),
    createdAt: readOptionalText(source.created_at ?? source.createdAt),
    applicantCount: readMetric(source, 'applicant_count', 'applicantCount'),
  };
}

export function normalizeApplication(row: any): AdminApplicationRow {
  const source = row || {};
  const status = source.status ?? source.application_status ?? source.applicationStatus ?? null;
  return {
    applicationId: readText(source.application_id ?? source.applicationId ?? source.id),
    dateApplied: readOptionalText(source.date_applied ?? source.dateApplied ?? source.applied_at ?? source.appliedAt),
    seekerName: readText(source.seeker_name ?? source.seekerName ?? source.applicant_name ?? source.applicantName),
    seekerEmail: readText(source.seeker_email ?? source.seekerEmail ?? source.email),
    jobId: readText(source.job_id ?? source.jobId),
    jobTitle: readText(source.job_title ?? source.jobTitle ?? source.title),
    companyName: readText(source.company_name ?? source.companyName),
    status: status == null || status === '' ? null : String(status),
  };
}

export function normalizeCompany(row: any): AdminCompanyRow {
  const source = row || {};
  return {
    companyId: readText(source.company_id ?? source.companyId ?? source.id),
    companyName: readText(source.company_name ?? source.companyName ?? source.name),
    slug: readText(source.slug),
    openJobsCount: readMetric(source, 'open_jobs_count', 'openJobsCount'),
    createdAt: readOptionalText(source.created_at ?? source.createdAt),
  };
}

export function normalizePage<T>(
  res: any,
  mapItem: (row: any) => T,
  fallbackPage: number,
  fallbackSize: number
): AdminPage<T> {
  const body = unwrapAdminBody(res);
  const source = body && typeof body === 'object' && !Array.isArray(body) ? body : {};
  const itemsRaw = Array.isArray(body) ? body : (source.items || []);
  const items = (Array.isArray(itemsRaw) ? itemsRaw : []).map(row => mapItem(row || {}));
  const total = readCount(source.total, items.length);
  const pageValue = readCount(source.page, fallbackPage);
  const sizeValue = readCount(
    source.pageSize != null ? source.pageSize : source.page_size,
    fallbackSize
  );
  return {
    items,
    total,
    page: pageValue > 0 ? pageValue : fallbackPage,
    pageSize: sizeValue > 0 ? sizeValue : fallbackSize,
  };
}

export function profileFields(profile: any, depth = 0, prefix = ''): ProfileField[] {
  if (!profile || typeof profile !== 'object' || Array.isArray(profile) || depth > 2) {
    return [];
  }
  const fields: ProfileField[] = [];
  Object.keys(profile).forEach(key => {
    if (SENSITIVE_KEY.test(key)) {
      return;
    }
    const value = profile[key];
    const label = humanizeKey(prefix ? `${prefix} ${key}` : key);
    if (Array.isArray(value)) {
      const rendered = value.map(item => {
        if (item == null || item === '') {
          return '';
        }
        return typeof item === 'object' ? JSON.stringify(item) : String(item);
      }).filter(Boolean).join(', ');
      fields.push({ label, value: rendered || '—' });
      return;
    }
    if (value && typeof value === 'object') {
      fields.push(...profileFields(value, depth + 1, key));
      return;
    }
    if (key === 'role' || key === 'role_id' || key === 'roleId') {
      fields.push({ label: 'Role', value: roleLabel(value) });
      return;
    }
    fields.push({
      label,
      value: value == null || value === '' ? '—' : String(value),
    });
  });
  return fields;
}

function readVisitSeries(value: any): VisitPoint[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map(point => {
    const source = point || {};
    const countValue = source.count != null ? source.count : source.visits;
    const numeric = Number(countValue);
    return {
      date: readText(source.date || source.day),
      count: Number.isFinite(numeric) ? numeric : 0,
    };
  }).filter(point => !!point.date);
}

function readMetric(source: any, snake: string, camel: string): number | null {
  if (!source || typeof source !== 'object') {
    return null;
  }
  const value = source[snake] != null ? source[snake] : source[camel];
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function readCount(value: any, fallback: number): number {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function readText(value: any): string {
  return value == null ? '' : String(value);
}

function readOptionalText(value: any): string | null {
  return value == null || value === '' ? null : String(value);
}

function humanizeKey(key: string): string {
  const spaced = key
    .replace(/_/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
  return spaced ? spaced.charAt(0).toUpperCase() + spaced.slice(1) : key;
}
