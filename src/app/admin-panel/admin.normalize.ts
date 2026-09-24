import { ADMIN_TIME_ZONE, manilaYmd } from './admin-time';
import {
  AdminApplicationRow,
  AdminCompanyContact,
  AdminCompanyDetail,
  AdminCompanyEvent,
  AdminCompanyRow,
  AdminCompanySubscription,
  AdminFinance,
  AdminJobAlertPage,
  AdminJobAlertRow,
  AdminJobAlertUserDetail,
  AdminJobRow,
  AdminPage,
  AdminPaymentRow,
  AdminPlanBreakdown,
  AdminSubscriptionRow,
  AdminUsageMeter,
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

export function isSeekerRole(role: number | string | null | undefined): boolean {
  const text = role == null ? '' : String(role).trim().toLowerCase();
  return text === '3' || text === 'jobseeker' || text === 'applicant' || text === 'candidate';
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

export function formatAdminMoney(value: number | null | undefined, currency = 'PHP'): string {
  if (value == null || !Number.isFinite(Number(value))) {
    return '—';
  }
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value));
}

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

/**
 * Calendar day in Asia/Manila, same "Sep 23, 2026" style as formatAdminDay.
 * Date-only strings are not shifted. Timestamps are converted to Manila first.
 */
export function formatAdminManilaDay(value: string | null | undefined): string {
  if (!value) {
    return '—';
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return formatAdminDay(value);
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return formatAdminDay(value);
  }
  return formatAdminDay(manilaYmd(date));
}

/** Manila date and time, e.g. "Sep 23, 2026, 9:00 AM". Date-only values stay day-style. */
export function formatAdminManilaDateTime(value: string | null | undefined): string {
  if (!value) {
    return '—';
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return formatAdminDay(value);
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return formatAdminDay(value);
  }
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: ADMIN_TIME_ZONE,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).formatToParts(date);
  const month = partOf(parts, 'month');
  const day = partOf(parts, 'day');
  const year = partOf(parts, 'year');
  const hour = partOf(parts, 'hour');
  const minute = partOf(parts, 'minute');
  const period = dayPeriodLabel(partOf(parts, 'dayPeriod'));
  if (!month || !day || !year || !hour || !minute) {
    return formatAdminManilaDay(value);
  }
  return `${month} ${Number(day)}, ${year}, ${hour}:${minute} ${period}`;
}

export function jobAlertStatusLabel(active: boolean): string {
  return active ? 'Active' : 'Inactive';
}

export function jobAlertStatusClass(active: boolean): string {
  return active ? 'admin-badge admin-badge--published' : 'admin-badge';
}

/** True/false when the payload says so. Null when the flag is absent. */
export function joaAvailableFrom(source: any): boolean | null {
  if (!source || typeof source !== 'object') {
    return null;
  }
  const value = source.joa_available != null ? source.joa_available : source.joaAvailable;
  if (value === undefined || value === null || value === '') {
    return null;
  }
  if (value === true || value === 1 || value === '1' || value === 'true') {
    return true;
  }
  if (value === false || value === 0 || value === '0' || value === 'false') {
    return false;
  }
  return null;
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

export function normalizeJobAlertRow(row: any): AdminJobAlertRow {
  const source = row || {};
  const explicitName = readText(source.seeker_name ?? source.seekerName ?? source.name);
  const combined = `${readText(source.first_name ?? source.firstName)} ${readText(source.last_name ?? source.lastName)}`.trim();
  return {
    id: readText(source.id),
    userUid: readText(source.user_uid ?? source.userUid ?? source.uid),
    seekerEmail: readText(source.seeker_email ?? source.seekerEmail ?? source.email),
    seekerName: explicitName || combined,
    seekerRole: source.seeker_role ?? source.seekerRole ?? source.role ?? source.role_id ?? source.roleId ?? null,
    seekerArchived: readLooseBool(source.seeker_archived ?? source.seekerArchived ?? source.is_archive ?? source.isArchive),
    position: readText(source.position),
    positionNormalized: readText(source.position_normalized ?? source.positionNormalized),
    jobRoleId: source.job_role_id ?? source.jobRoleId ?? null,
    active: readLooseBool(source.active),
    createdAt: readOptionalText(source.created_at ?? source.createdAt),
    updatedAt: readOptionalText(source.updated_at ?? source.updatedAt),
    instantSentAt: readOptionalText(source.instant_sent_at ?? source.instantSentAt),
    instantMessageId: readOptionalText(source.instant_message_id ?? source.instantMessageId),
    instantJobCount: readMetric(source, 'instant_job_count', 'instantJobCount'),
    instantClaimedAt: readOptionalText(source.instant_claimed_at ?? source.instantClaimedAt),
    lastDigestWeek: readOptionalText(source.last_digest_week ?? source.lastDigestWeek),
    lastDigestSentAt: readOptionalText(source.last_digest_sent_at ?? source.lastDigestSentAt),
    lastDigestMessageId: readOptionalText(source.last_digest_message_id ?? source.lastDigestMessageId),
    lastDigestJobCount: readMetric(source, 'last_digest_job_count', 'lastDigestJobCount'),
  };
}

export function normalizeJobAlertPage(
  res: any,
  fallbackPage: number,
  fallbackSize: number
): AdminJobAlertPage {
  const page = normalizePage(res, normalizeJobAlertRow, fallbackPage, fallbackSize);
  const body = unwrapAdminBody(res);
  const source = body && typeof body === 'object' && !Array.isArray(body) ? body : {};
  const flag = joaAvailableFrom(source);
  return {
    ...page,
    joaAvailable: flag == null ? true : flag,
  };
}

export function normalizeJobAlertUser(res: any, fallbackUid: string): AdminJobAlertUserDetail | null {
  const body = unwrapAdminBody(res);
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return null;
  }
  const flag = joaAvailableFrom(body);
  if (flag === false && body.subscriptions == null && !Array.isArray(body.items)) {
    return emptyJobAlertUser(fallbackUid, false);
  }
  if (body.subscriptions == null && Array.isArray(body.items)) {
    return null;
  }
  const seeker = body.seeker && typeof body.seeker === 'object'
    ? body.seeker
    : (body.user && typeof body.user === 'object' ? body.user : body);
  const subscriptions = (Array.isArray(body.subscriptions) ? body.subscriptions : []).map(row => normalizeJobAlertRow(row));
  const userUid = readText(
    seeker.user_uid ?? seeker.userUid ?? seeker.uid ?? body.user_uid ?? body.userUid
  ) || fallbackUid;
  if (!userUid) {
    return null;
  }
  const activeCount = readCount(
    seeker.active_count != null ? seeker.active_count : (body.active_count != null ? body.active_count : body.activeCount),
    subscriptions.filter(row => row.active).length
  );
  const totalCount = readCount(
    seeker.total_count != null ? seeker.total_count : (body.total_count != null ? body.total_count : body.totalCount),
    subscriptions.length
  );
  return {
    userUid,
    seekerName: readText(seeker.seeker_name ?? seeker.seekerName ?? seeker.name)
      || `${readText(seeker.first_name ?? seeker.firstName)} ${readText(seeker.last_name ?? seeker.lastName)}`.trim(),
    seekerEmail: readText(seeker.seeker_email ?? seeker.seekerEmail ?? seeker.email),
    seekerRole: seeker.seeker_role ?? seeker.seekerRole ?? seeker.role ?? null,
    seekerArchived: readLooseBool(seeker.seeker_archived ?? seeker.seekerArchived ?? seeker.is_archive ?? seeker.isArchive),
    createdAt: readOptionalText(seeker.created_at ?? seeker.createdAt ?? seeker.created_date ?? seeker.createdDate),
    activeCount,
    totalCount,
    subscriptions,
    joaAvailable: flag == null ? true : flag,
    fromFixture: false,
  };
}

function emptyJobAlertUser(userUid: string, joaAvailable: boolean): AdminJobAlertUserDetail {
  return {
    userUid,
    seekerName: '',
    seekerEmail: '',
    seekerRole: null,
    seekerArchived: false,
    createdAt: null,
    activeCount: 0,
    totalCount: 0,
    subscriptions: [],
    joaAvailable,
    fromFixture: false,
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

/** V4 admin labels. Legacy Enterprise and any unknown slug fold into Other. */
export function financePlanLabel(slug: string | null | undefined): string {
  const labels: Record<string, string> = {
    free_trial: 'Free trial',
    starter: 'Starter',
    growth: 'Growth',
    business: 'Business',
  };
  const key = (slug || '').trim().toLowerCase();
  return labels[key] || 'Other';
}

export function billingStatusLabel(status: string | null | undefined): string {
  const labels: Record<string, string> = {
    trialing: 'Trialing',
    active: 'Active',
    past_due: 'Past due',
    grace: 'Grace',
    expired: 'Expired',
    none: 'None',
    succeeded: 'Succeeded',
    failed: 'Failed',
    pending: 'Pending',
  };
  const key = (status || '').trim().toLowerCase();
  if (!key) {
    return '—';
  }
  return labels[key] || String(status);
}

export function billingStatusClass(status: string | null | undefined): string {
  const key = (status || '').trim().toLowerCase();
  if (key === 'past_due' || key === 'failed' || key === 'expired') {
    return 'admin-badge admin-badge--closed';
  }
  if (key === 'active' || key === 'succeeded') {
    return 'admin-badge admin-badge--published';
  }
  return 'admin-badge';
}

export function billingCycleLabel(cycle: string | null | undefined): string {
  const key = (cycle || '').trim().toLowerCase();
  if (key === 'annual' || key === 'yearly') {
    return 'Annual';
  }
  if (key === 'monthly') {
    return 'Monthly';
  }
  return key ? String(cycle) : '—';
}

export function normalizeFinance(res: any): AdminFinance | null {
  const body = unwrapAdminBody(res);
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return null;
  }
  const hasSignal = [
    'mrr',
    'mrr_php',
    'active_count',
    'activeCount',
    'active_subscriptions',
    'revenue_in_range',
    'revenueInRange',
    'revenue_in_range_php',
    'plans',
    'plan_breakdown',
    'subscriptions',
  ].some(key => body[key] != null);
  if (!hasSignal) {
    return null;
  }
  const subscriptions = normalizePage(
    body.subscriptions != null ? body.subscriptions : [],
    normalizeSubscription,
    readCount(body.page, 1),
    readCount(body.pageSize != null ? body.pageSize : body.page_size, 25)
  );
  const paymentsSource = body.payments != null ? body.payments : [];
  const payments = normalizePage(paymentsSource, normalizePayment, 1, 25);
  return {
    currency: readText(body.currency) || 'PHP',
    mrr: readCount(body.mrr_php != null ? body.mrr_php : body.mrr, 0),
    revenueInRange: readCount(
      body.revenue_in_range_php != null ? body.revenue_in_range_php : (body.revenue_in_range != null ? body.revenue_in_range : body.revenueInRange),
      0
    ),
    payingCompanies: readCount(body.paying_companies != null ? body.paying_companies : body.payingCompanies, 0),
    activeCount: readCount(
      body.active_subscriptions != null ? body.active_subscriptions : (body.active_count != null ? body.active_count : body.activeCount),
      0
    ),
    trialCount: readCount(body.trials != null ? body.trials : (body.trial_count != null ? body.trial_count : body.trialCount), 0),
    pastDueCount: readCount(body.past_due != null ? body.past_due : (body.pastDueCount != null ? body.pastDueCount : body.past_due_count), 0),
    plans: readPlans(body.plan_breakdown != null ? body.plan_breakdown : body.plans),
    from: readOptionalText(body.from),
    to: readOptionalText(body.to),
    subscriptions,
    payments,
    fromFixture: false,
  };
}

export function normalizeCompanyDetail(res: any): AdminCompanyDetail | null {
  const body = unwrapAdminBody(res);
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return null;
  }
  const companyId = readText(body.company_id ?? body.companyId ?? (body.id != null && !body.items ? body.id : ''));
  if (!companyId) {
    return null;
  }
  const admins = readAdmins(body);
  const subscriptionSource = body.subscription;
  return {
    companyId,
    companyName: readText(body.company_name ?? body.companyName ?? body.name),
    slug: readText(body.slug),
    createdAt: readOptionalText(body.created_at ?? body.createdAt),
    openJobsCount: readMetric(body, 'open_jobs_count', 'openJobsCount'),
    status: readOptionalText(body.status),
    adminContact: admins.length ? admins[0] : null,
    admins,
    subscription: subscriptionSource ? normalizeCompanySubscription(subscriptionSource) : null,
    payments: (Array.isArray(body.payments) ? body.payments : []).map(row => normalizePayment(row)),
    history: (Array.isArray(body.history) ? body.history : []).map(row => normalizeCompanyEvent(row)),
    fromFixture: false,
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

function normalizeSubscription(row: any): AdminSubscriptionRow {
  const source = row || {};
  const planSlug = readText(source.plan_slug ?? source.planSlug ?? source.slug);
  return {
    companyId: readText(source.company_id ?? source.companyId),
    companyName: readText(source.company_name ?? source.companyName),
    planSlug,
    planLabel: financePlanLabel(planSlug),
    status: readText(source.status).toLowerCase(),
    cycle: readText(source.cycle ?? source.billing_cycle ?? source.billingCycle).toLowerCase(),
    periodEnd: readOptionalText(source.period_end ?? source.periodEnd ?? source.renews_at ?? source.renewsAt),
    mrr: readCount(source.mrr_php != null ? source.mrr_php : source.mrr, 0),
    lastPaymentAt: readOptionalText(source.last_payment_at ?? source.lastPaymentAt),
  };
}

function normalizePayment(row: any): AdminPaymentRow {
  const source = row || {};
  const planSlug = readText(source.plan_slug ?? source.planSlug ?? source.slug);
  const explicitLabel = readText(source.plan_label ?? source.planLabel ?? source.plan);
  return {
    paymentId: readText(source.payment_id ?? source.paymentId ?? source.id),
    externalId: readText(source.external_id ?? source.externalId),
    companyId: readText(source.company_id ?? source.companyId),
    companyName: readText(source.company_name ?? source.companyName),
    planLabel: planSlug ? financePlanLabel(planSlug) : (explicitLabel || '—'),
    paidAt: readText(source.paid_at ?? source.paidAt ?? source.date),
    amount: readCount(source.amount_php != null ? source.amount_php : source.amount, 0),
    method: readText(source.method),
    status: readText(source.status).toLowerCase(),
  };
}

function normalizeContact(row: any): AdminCompanyContact {
  const source = row || {};
  return {
    name: readText(source.name),
    email: readText(source.email),
    phone: readOptionalText(source.phone),
    role: readText(source.role),
  };
}

function normalizeCompanySubscription(row: any): AdminCompanySubscription {
  const source = row || {};
  const planSlug = readText(source.plan_slug ?? source.planSlug ?? source.slug);
  const trial = source.trial_days_left != null ? source.trial_days_left : source.trialDaysLeft;
  return {
    plan: financePlanLabel(planSlug),
    planSlug,
    status: readText(source.status).toLowerCase(),
    cycle: readText(source.cycle ?? source.billing_cycle ?? source.billingCycle).toLowerCase(),
    mrr: readCount(source.mrr_php != null ? source.mrr_php : source.mrr, 0),
    startedAt: readOptionalText(source.started_at ?? source.startedAt),
    periodEnd: readOptionalText(source.period_end ?? source.periodEnd ?? source.renews_at ?? source.renewsAt),
    trialDaysLeft: trial == null || trial === '' ? null : readCount(trial, 0),
    entitlements: readMeters(source.entitlements),
  };
}

function normalizeCompanyEvent(row: any): AdminCompanyEvent {
  const source = row || {};
  return {
    at: readText(source.at ?? source.date),
    kind: readText(source.kind ?? source.type),
    summary: readText(source.summary ?? source.description),
    actor: readOptionalText(source.actor),
  };
}

function readAdmins(body: any): AdminCompanyContact[] {
  const list = body.admins != null ? body.admins : body.admin_users;
  if (Array.isArray(list) && list.length) {
    return list.map(row => normalizeContact(row));
  }
  const single = body.admin_contact != null ? body.admin_contact : body.adminContact;
  return single ? [normalizeContact(single)] : [];
}

function readMeters(value: any): AdminUsageMeter[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map(row => {
    const source = row || {};
    const limitRaw = source.limit != null ? source.limit : source.cap;
    const limitNumber = limitRaw == null || limitRaw === '' ? null : Number(limitRaw);
    return {
      label: readText(source.label ?? source.name),
      used: readCount(source.used, 0),
      limit: limitNumber != null && Number.isFinite(limitNumber) ? limitNumber : null,
    };
  });
}

function readPlans(value: any): AdminPlanBreakdown[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map(row => {
    const source = row || {};
    const slug = readText(source.slug ?? source.plan_slug ?? source.planSlug);
    return {
      slug: slug || 'other',
      label: readText(source.label ?? source.plan ?? source.name) || financePlanLabel(slug),
      count: readCount(source.company_count != null ? source.company_count : source.count, 0),
      pct: readCount(source.pct, 0),
    };
  });
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

function readLooseBool(value: any): boolean {
  return value === true || value === 1 || value === '1' || value === 'true' || value === 't';
}

function partOf(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes): string {
  const found = parts.find(part => part.type === type);
  return found ? found.value : '';
}

function dayPeriodLabel(value: string): string {
  const text = value.replace(/\./g, '').trim().toUpperCase();
  if (text.indexOf('A') === 0) {
    return 'AM';
  }
  if (text.indexOf('P') === 0) {
    return 'PM';
  }
  return text;
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
