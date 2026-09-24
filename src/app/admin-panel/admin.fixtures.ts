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
 *   GET /admin/finance?range=&from=&to=&q=&plan=&status=&payStatus=&page=&pageSize=&payPage=
 *     snapshot: mrr_php, paying_companies, active_subscriptions, trials, past_due
 *     plan_breakdown[{ slug, label, company_count, pct }]
 *     revenue_in_range_php (succeeded payments only)
 *     subscriptions directory (not range-bound) and payments whose paid_at is in range
 *   GET /admin/companies/:companyId
 *     profile, admins, subscription, payments (full history), history[{ at, kind, summary, actor }]
 *   Later splits Clarence can own: /companies/:id/payments and /companies/:id/history
 *
 * Gaps while this flag stays on:
 * - Site visits are pageview fixtures, labeled "Pageviews (fixture)". There is no admin analytics API.
 * - applications_in_range falls back to applications_7d / applications_30d when the preset matches,
 *   otherwise to the fixture catalog. Today and custom need the new field.
 * - GET /admin/applications does not exist yet. The ops list is fixture-only until it does.
 * - GET /admin/job-opening-alerts and GET /admin/job-opening-alerts/users/:userUid
 *   are fixture-backed until Clarence ships them. joa_available false is an empty list
 *   plus a calm note, not a hard error.
 *   Formal shots (fixture fallback, Asia/Manila "now"):
 *     /admin/job-alerts
 *       Last 7 days + Active. Populated list.
 *     /admin/job-alerts?user=U-200
 *       Panel for Ada Cruz: several positions, normalized key, send ids, lease.
 *     /admin/job-alerts?shot=empty
 *       Empty Active range.
 *     /admin/job-alerts?status=inactive&shot=empty
 *       Empty Inactive / All copy.
 *     /admin/job-alerts?shot=unavailable
 *       joa_available false.
 *   `shot` is local only. It is not sent to the API. A live payload ignores it.
 * - Job status words are mapped to job_status_id 1–4 before the jobs request.
 * - Users last_login is shown as — when the list omits it (the column is not on the BE list today).
 * - Full-dashboard fixture mode (HTTP failure) also invents inventory totals. The screen says so.
 * - GET /admin/finance and GET /admin/companies/:id are not on the API yet.
 *   Finance plan labels are the V4 set: Free trial, Starter, Growth, Business.
 *   Legacy Enterprise and a missing plan display as Other.
 *   Annual MRR is monthly-equivalent (catalog annual ÷ 12).
 *   Only succeeded payments count toward revenue. Failed and pending stay on the table.
 *   Finance is read-only: no charge, refund, or plan-change actions.
 */
import {
  AdminApplicationQuery,
  AdminApplicationRow,
  AdminCompanyContact,
  AdminJobAlertPage,
  AdminJobAlertQuery,
  AdminJobAlertRow,
  AdminJobAlertUserDetail,
  JobAlertFixtureShot,
  AdminCompanyDetail,
  AdminCompanyEvent,
  AdminCompanyRow,
  AdminFinance,
  AdminFinanceQuery,
  AdminJobQuery,
  AdminJobRow,
  AdminListQuery,
  AdminPage,
  AdminPaymentRow,
  AdminPlanBreakdown,
  AdminSubscriptionRow,
  AdminUserQuery,
  AdminUserRow,
  Dashboard,
  VisitPoint,
} from './admin.model';
import { addDays, eachDay, inclusiveDayCount, manilaYmd, previousWindow, AdminTimeRange } from './admin-time';
import { financePlanLabel, jobStatusLabel, jobStatusQueryValue } from './admin.normalize';

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

/**
 * Finance labels are the V4 set from the addendum: Free trial, Starter, Growth, Business.
 * Enterprise is legacy and displays as Other. Annual catalog price is 10× monthly;
 * MRR for an annual plan is annual ÷ 12 (Business 59900 / 12 = 4992).
 * Payment offsets are days before today so Last 7 days stays populated and Today stays empty.
 */
interface FixtureCharge {
  offset: number;
  status: 'succeeded' | 'failed' | 'pending';
}

interface FixtureEmployer {
  row: AdminCompanyRow;
  admins: AdminCompanyContact[];
  planSlug: string;
  subscriptionStatus: 'active' | 'trialing' | 'past_due' | 'grace' | 'expired' | 'none';
  cycle: 'monthly' | 'annual';
  /** Monthly-equivalent. Counted in Current MRR only when status is active. */
  mrr: number;
  chargeAmount: number;
  startedAt: string;
  /** Days from today. Negative means the period already ended. */
  periodEndOffset: number;
  videosUsed: number;
  charges: FixtureCharge[];
  planChange: { at: string; summary: string; actor: string } | null;
  expiredAt: string | null;
}

const FIXTURE_EMPLOYERS: FixtureEmployer[] = [
  employer({
    companyId: 'CO-20', companyName: "Lola's Table", slug: 'lolas-table', openJobsCount: 2, createdAt: '2025-04-18',
    planSlug: 'growth', subscriptionStatus: 'active', cycle: 'monthly', mrr: 3490, chargeAmount: 3490,
    startedAt: '2025-04-18', periodEndOffset: 30, videosUsed: 8, charges: [{ offset: 1, status: 'succeeded' }, { offset: 32, status: 'succeeded' }],
    adminName: 'Rosa Delgado', adminEmail: 'rosa.delgado@lolas.example', adminPhone: '+63 917 555 0120',
    planChange: { at: '2026-08-01', summary: 'Moved from Starter to Growth', actor: 'Rosa Delgado' },
  }),
  employer({
    companyId: 'CO-21', companyName: 'Harbor Inn', slug: 'harbor-inn', openJobsCount: 1, createdAt: '2025-08-03',
    planSlug: 'starter', subscriptionStatus: 'active', cycle: 'monthly', mrr: 1490, chargeAmount: 1490,
    startedAt: '2025-08-03', periodEndOffset: 21, videosUsed: 4, charges: [{ offset: 3, status: 'succeeded' }, { offset: 34, status: 'succeeded' }],
    adminName: 'Ben Cruz', adminEmail: 'ben.cruz@harbor.example', adminPhone: '+63 918 555 0144',
  }),
  employer({
    companyId: 'CO-22', companyName: 'Northline Logistics', slug: 'northline', openJobsCount: 4, createdAt: '2026-01-22',
    planSlug: 'business', subscriptionStatus: 'active', cycle: 'annual', mrr: 4992, chargeAmount: 59900,
    startedAt: '2026-01-22', periodEndOffset: 200, videosUsed: 12, charges: [{ offset: 15, status: 'succeeded' }],
    adminName: 'Irene Santos', adminEmail: 'irene.santos@northline.example', adminPhone: '+63 919 555 0177',
    extraAdmins: 5,
  }),
  employer({
    companyId: 'CO-23', companyName: 'Cupping Room', slug: 'cupping-room', openJobsCount: 1, createdAt: '2026-06-15',
    planSlug: 'free_trial', subscriptionStatus: 'trialing', cycle: 'monthly', mrr: 0, chargeAmount: 0,
    startedAt: '2026-09-17', periodEndOffset: 4, videosUsed: 1, charges: [],
    adminName: 'Marco Villanueva', adminEmail: 'marco@cupping.example', adminPhone: '+63 920 555 0190',
  }),
  employer({
    companyId: 'CO-24', companyName: 'Bay & Co.', slug: 'bay-and-co', openJobsCount: 0, createdAt: '2025-09-12',
    planSlug: 'starter', subscriptionStatus: 'expired', cycle: 'monthly', mrr: 0, chargeAmount: 1490,
    startedAt: '2025-09-12', periodEndOffset: -30, videosUsed: 0, charges: [{ offset: 45, status: 'succeeded' }],
    adminName: 'Liza Gomez', adminEmail: 'liza.gomez@bayandco.example', adminPhone: '+63 921 555 0112',
    expiredAt: '2026-08-20',
  }),
  employer({
    companyId: 'CO-25', companyName: 'QuickCart', slug: 'quickcart', openJobsCount: 1, createdAt: '2026-03-02',
    planSlug: 'enterprise', subscriptionStatus: 'active', cycle: 'monthly', mrr: 18000, chargeAmount: 18000,
    startedAt: '2026-03-02', periodEndOffset: 18, videosUsed: 20, charges: [{ offset: 6, status: 'succeeded' }, { offset: 40, status: 'succeeded' }],
    adminName: 'Carlo Tan', adminEmail: 'carlo.tan@quickcart.example', adminPhone: '+63 922 555 0166',
  }),
  employer({
    companyId: 'CO-26', companyName: 'Mesa Verde', slug: 'mesa-verde', openJobsCount: 1, createdAt: '2026-02-02',
    planSlug: 'business', subscriptionStatus: 'past_due', cycle: 'monthly', mrr: 5990, chargeAmount: 5990,
    startedAt: '2026-02-02', periodEndOffset: -3, videosUsed: 6,
    charges: [{ offset: 2, status: 'failed' }, { offset: 4, status: 'pending' }, { offset: 33, status: 'succeeded' }],
    adminName: 'Nia Flores', adminEmail: 'nia.flores@mesaverde.example', adminPhone: '+63 923 555 0188',
  }),
];

const FIXTURE_COMPANIES: AdminCompanyRow[] = FIXTURE_EMPLOYERS.map(row => row.row);

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

/** Deep-link uid for the populated seeker panel (Ada Cruz, several subscriptions). */
export const JOA_FIXTURE_PANEL_UID = 'U-200';

/**
 * One row per subscription. Offsets are days before `now` on the Manila calendar,
 * so Last 7 days stays populated whenever the shot is taken.
 * Message ids use the joa-msg- prefix so list shots can prove they stay off the list.
 */
export function fixtureJobAlertCatalog(now = new Date()): AdminJobAlertRow[] {
  const stamp = (offset: number, hour: number, minute: number) => {
    const day = addDays(manilaYmd(now), -offset);
    return `${day}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00+08:00`;
  };
  const row = (seed: AlertSeed): AdminJobAlertRow => {
    const createdAt = stamp(seed.offset, seed.hour == null ? 9 : seed.hour, 4);
    const instant = seed.instant;
    const digest = seed.digest;
    return {
      id: seed.id,
      userUid: seed.userUid,
      seekerEmail: seed.seekerEmail,
      seekerName: seed.seekerName,
      seekerRole: seed.seekerRole,
      seekerArchived: !!seed.seekerArchived,
      position: seed.position,
      positionNormalized: seed.positionNormalized,
      jobRoleId: seed.jobRoleId == null ? null : seed.jobRoleId,
      active: seed.active,
      createdAt,
      updatedAt: createdAt,
      instantSentAt: instant ? stamp(instant.offset, instant.hour, 12) : null,
      instantMessageId: instant ? instant.messageId : null,
      instantJobCount: instant ? instant.count : null,
      instantClaimedAt: seed.claimed ? stamp(seed.claimed.offset, seed.claimed.hour, 40) : null,
      lastDigestWeek: digest ? (digest.week || addDays(manilaYmd(now), -digest.offset)) : null,
      lastDigestSentAt: digest ? stamp(digest.offset, digest.hour, 30) : null,
      lastDigestMessageId: digest ? digest.messageId : null,
      lastDigestJobCount: digest ? digest.count : null,
    };
  };
  return [
    row({
      id: 'JOA-200-1', userUid: 'U-200', seekerName: 'Ada Cruz', seekerEmail: 'ada.cruz@example.com',
      seekerRole: 3, position: 'Marketing Manager', positionNormalized: 'marketing manager', jobRoleId: 12,
      active: true, offset: 1, hour: 11,
      instant: { offset: 0, hour: 8, count: 4, messageId: 'joa-msg-instant-ada-marketing' },
      digest: { offset: 0, hour: 8, count: 7, messageId: 'joa-msg-digest-ada-marketing' },
    }),
    row({
      id: 'JOA-200-2', userUid: 'U-200', seekerName: 'Ada Cruz', seekerEmail: 'ada.cruz@example.com',
      seekerRole: 3, position: 'Kitchen Lead', positionNormalized: 'kitchen lead',
      active: true, offset: 2,
      claimed: { offset: 0, hour: 7 },
    }),
    row({
      id: 'JOA-200-3', userUid: 'U-200', seekerName: 'Ada Cruz', seekerEmail: 'ada.cruz@example.com',
      seekerRole: 3, position: 'Barista', positionNormalized: 'barista',
      active: false, offset: 3,
      instant: { offset: 2, hour: 9, count: 2, messageId: 'joa-msg-instant-ada-barista' },
    }),
    row({
      id: 'JOA-200-4', userUid: 'U-200', seekerName: 'Ada Cruz', seekerEmail: 'ada.cruz@example.com',
      seekerRole: 3, position: 'Nurse', positionNormalized: 'Nurse',
      active: true, offset: 20,
    }),
    row({
      id: 'JOA-201-1', userUid: 'U-201', seekerName: 'Miguel Santos', seekerEmail: 'miguel.santos@example.com',
      seekerRole: 2, position: 'Front Desk Associate', positionNormalized: 'front desk associate',
      active: true, offset: 0, hour: 10,
      instant: { offset: 0, hour: 11, count: 2, messageId: 'joa-msg-instant-miguel-front-desk' },
    }),
    row({
      id: 'JOA-202-1', userUid: 'U-202', seekerName: 'Jonah Reyes', seekerEmail: 'jonah.reyes@example.com',
      seekerRole: 3, seekerArchived: true, position: 'Retail Merchandiser', positionNormalized: 'retail merchandiser',
      active: true, offset: 4,
      digest: { offset: 1, hour: 8, count: 6, messageId: 'joa-msg-digest-jonah-retail' },
    }),
    row({
      id: 'JOA-203-1', userUid: 'U-203', seekerName: 'Priya Nair', seekerEmail: 'priya.nair@example.com',
      seekerRole: 3, position: 'Warehouse Associate', positionNormalized: 'warehouse associate',
      active: true, offset: 5,
      instant: { offset: 4, hour: 9, count: 3, messageId: 'joa-msg-instant-priya-warehouse' },
      digest: { offset: 1, hour: 8, count: 5, messageId: 'joa-msg-digest-priya-warehouse' },
    }),
    row({
      id: 'JOA-204-1', userUid: 'U-204', seekerName: 'Liza Gomez', seekerEmail: 'liza.gomez@example.com',
      seekerRole: 3, position: 'Delivery Rider', positionNormalized: 'delivery rider',
      active: false, offset: 1, hour: 14,
    }),
    row({
      id: 'JOA-205-1', userUid: 'U-205', seekerName: 'Carlo Tan', seekerEmail: 'carlo.tan@example.com',
      seekerRole: 3, position: 'Barista', positionNormalized: 'Barista',
      active: true, offset: 6,
      instant: { offset: 5, hour: 16, count: 1, messageId: 'joa-msg-instant-carlo-barista' },
    }),
    row({
      id: 'JOA-206-1', userUid: 'U-206', seekerName: 'Ops Admin', seekerEmail: 'ops@gethired.example',
      seekerRole: 1, seekerArchived: true, position: 'Night Auditor', positionNormalized: 'night auditor',
      active: false, offset: 45,
    }),
  ];
}

export function fixtureJobAlerts(query: AdminJobAlertQuery, now = new Date()): AdminJobAlertPage {
  const page = query.page > 0 ? query.page : 1;
  const pageSize = query.pageSize > 0 ? query.pageSize : 25;
  if (query.fixtureShot === 'unavailable' || query.fixtureShot === 'empty') {
    return {
      items: [],
      total: 0,
      page,
      pageSize,
      fromFixture: true,
      joaAvailable: query.fixtureShot !== 'unavailable',
    };
  }
  const q = (query.q || '').trim().toLowerCase();
  const filtered = fixtureJobAlertCatalog(now).filter(row => {
    const day = (row.createdAt || '').slice(0, 10);
    if (query.from && day < query.from) {
      return false;
    }
    if (query.to && day > query.to) {
      return false;
    }
    if (query.active === true && !row.active) {
      return false;
    }
    if (query.active === false && row.active) {
      return false;
    }
    if (!q) {
      return true;
    }
    const haystack = `${row.seekerName} ${row.seekerEmail} ${row.position}`.toLowerCase();
    return haystack.indexOf(q) !== -1;
  }).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)) || String(b.id).localeCompare(String(a.id)));
  const paged = pageOf(filtered, page, pageSize);
  return { ...paged, joaAvailable: true };
}

export function fixtureJobAlertUser(
  userUid: string,
  shot?: JobAlertFixtureShot | null,
  now = new Date()
): AdminJobAlertUserDetail | null {
  if (shot === 'unavailable') {
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
      joaAvailable: false,
      fromFixture: true,
    };
  }
  const subscriptions = fixtureJobAlertCatalog(now)
    .filter(row => row.userUid === userUid)
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)) || String(b.id).localeCompare(String(a.id)));
  if (!subscriptions.length) {
    return null;
  }
  const first = subscriptions[0];
  return {
    userUid,
    seekerName: first.seekerName,
    seekerEmail: first.seekerEmail,
    seekerRole: first.seekerRole,
    seekerArchived: first.seekerArchived,
    createdAt: null,
    activeCount: subscriptions.filter(row => row.active).length,
    totalCount: subscriptions.length,
    subscriptions,
    joaAvailable: true,
    fromFixture: true,
  };
}

interface AlertSeed {
  id: string;
  userUid: string;
  seekerName: string;
  seekerEmail: string;
  seekerRole: number;
  seekerArchived?: boolean;
  position: string;
  positionNormalized: string;
  jobRoleId?: number | null;
  active: boolean;
  offset: number;
  hour?: number;
  instant?: { offset: number; hour: number; count: number; messageId: string } | null;
  claimed?: { offset: number; hour: number } | null;
  digest?: { offset: number; hour: number; count: number; messageId: string; week?: string } | null;
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

export function fixtureFinance(query: AdminFinanceQuery, now = new Date()): AdminFinance {
  const today = manilaYmd(now);
  const from = query.from || today;
  const to = query.to || today;
  const q = (query.q || '').trim().toLowerCase();
  const plan = (query.plan || '').trim().toLowerCase();
  const subscriptionStatus = (query.subscriptionStatus || '').trim().toLowerCase();
  const paymentStatus = (query.paymentStatus || '').trim().toLowerCase();
  const payments = paymentCatalog(now);
  const inRange = (row: AdminPaymentRow) => {
    const day = (row.paidAt || '').slice(0, 10);
    return (!from || day >= from) && (!to || day <= to);
  };
  const subscriptions = FIXTURE_EMPLOYERS
    .map(account => subscriptionRow(account, today, payments))
    .filter(row => !plan || planBucket(row.planSlug) === plan)
    .filter(row => !subscriptionStatus || row.status === subscriptionStatus)
    .filter(row => !q || row.companyName.toLowerCase().indexOf(q) !== -1);
  const paymentRows = payments
    .filter(inRange)
    .filter(row => !paymentStatus || row.status === paymentStatus)
    .filter(row => !q || `${row.companyName} ${row.externalId} ${row.planLabel}`.toLowerCase().indexOf(q) !== -1);

  return {
    currency: 'PHP',
    mrr: FIXTURE_EMPLOYERS
      .filter(row => row.subscriptionStatus === 'active')
      .reduce((total, row) => total + row.mrr, 0),
    revenueInRange: sumAmounts(payments.filter(row => row.status === 'succeeded' && inRange(row))),
    payingCompanies: FIXTURE_EMPLOYERS.filter(row => row.subscriptionStatus === 'active' && row.mrr > 0).length,
    activeCount: FIXTURE_EMPLOYERS.filter(row => row.subscriptionStatus === 'active').length,
    trialCount: FIXTURE_EMPLOYERS.filter(row => row.subscriptionStatus === 'trialing').length,
    pastDueCount: FIXTURE_EMPLOYERS.filter(row => row.subscriptionStatus === 'past_due').length,
    plans: planBreakdown(),
    from,
    to,
    subscriptions: pageOf(subscriptions, query.page, query.pageSize),
    payments: pageOf(paymentRows, query.paymentPage, query.pageSize),
    fromFixture: true,
  };
}

export function fixtureCompanyDetail(companyId: string, now = new Date()): AdminCompanyDetail | null {
  const employer = FIXTURE_EMPLOYERS.find(row => row.row.companyId === companyId);
  if (!employer) {
    return null;
  }
  const today = manilaYmd(now);
  const payments = paymentCatalog(now)
    .filter(row => row.companyId === companyId)
    .sort((a, b) => b.paidAt.localeCompare(a.paidAt));
  const jobs = FIXTURE_JOB_ROWS.filter(row => row.companyName === employer.row.companyName);
  const plan = financePlanLabel(employer.planSlug);
  const periodEnd = addDays(today, employer.periodEndOffset);
  const history: AdminCompanyEvent[] = [
    {
      at: employer.row.createdAt || '',
      kind: 'Company',
      summary: `${employer.row.companyName} was created`,
      actor: null,
    },
    {
      at: employer.startedAt,
      kind: 'Subscription',
      summary: `Started ${plan} (${employer.subscriptionStatus})`,
      actor: employer.admins[0] ? employer.admins[0].name : null,
    },
  ];
  if (employer.planChange) {
    history.push({
      at: employer.planChange.at,
      kind: 'Plan change',
      summary: employer.planChange.summary,
      actor: employer.planChange.actor,
    });
  }
  if (employer.expiredAt) {
    history.push({
      at: employer.expiredAt,
      kind: 'Subscription',
      summary: 'Subscription expired',
      actor: null,
    });
  }
  payments.forEach(payment => {
    history.push({
      at: payment.paidAt,
      kind: 'Payment',
      summary: `${payment.status} ${payment.amount} PHP · ${payment.externalId}`,
      actor: null,
    });
  });
  jobs.forEach(job => {
    const unpublished = Number(job.status) === 4;
    history.push({
      at: job.createdAt || '',
      kind: unpublished ? 'Job unpublish' : 'Job post',
      summary: unpublished ? `${job.title} unpublished by admin` : `${job.title} (${job.statusLabel})`,
      actor: unpublished ? 'Ops admin' : null,
    });
  });
  history.sort((a, b) => b.at.localeCompare(a.at));
  const trialDaysLeft = employer.subscriptionStatus === 'trialing'
    ? Math.max(0, inclusiveDayCount(today, periodEnd) - 1)
    : null;

  return {
    companyId: employer.row.companyId,
    companyName: employer.row.companyName,
    slug: employer.row.slug,
    createdAt: employer.row.createdAt,
    openJobsCount: employer.row.openJobsCount,
    status: employer.subscriptionStatus,
    adminContact: employer.admins[0] || null,
    admins: employer.admins,
    subscription: {
      plan,
      planSlug: employer.planSlug,
      status: employer.subscriptionStatus,
      cycle: employer.cycle,
      mrr: employer.subscriptionStatus === 'active' ? employer.mrr : 0,
      startedAt: employer.startedAt,
      periodEnd,
      trialDaysLeft,
      entitlements: entitlementMeters(employer),
    },
    payments,
    history,
    fromFixture: true,
  };
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

const PLAN_BREAKDOWN_ORDER: { slug: string; label: string }[] = [
  { slug: 'free_trial', label: 'Free trial' },
  { slug: 'starter', label: 'Starter' },
  { slug: 'growth', label: 'Growth' },
  { slug: 'business', label: 'Business' },
  { slug: 'other', label: 'Other' },
];

/** Growth caps match planCatalogServiceV4: 6 jobs, 3 admins, 100 videos. */
const ENTITLEMENT_LIMITS: Record<string, { jobs: number | null; admins: number | null; videos: number | null }> = {
  free_trial: { jobs: 1, admins: 1, videos: 5 },
  starter: { jobs: 5, admins: 2, videos: 25 },
  growth: { jobs: 6, admins: 3, videos: 100 },
  business: { jobs: 40, admins: 15, videos: 400 },
};

function employer(input: {
  companyId: string;
  companyName: string;
  slug: string;
  openJobsCount: number;
  createdAt: string;
  planSlug: string;
  subscriptionStatus: FixtureEmployer['subscriptionStatus'];
  cycle: FixtureEmployer['cycle'];
  mrr: number;
  chargeAmount: number;
  startedAt: string;
  periodEndOffset: number;
  videosUsed: number;
  charges: FixtureCharge[];
  adminName: string;
  adminEmail: string;
  adminPhone: string;
  extraAdmins?: number;
  planChange?: FixtureEmployer['planChange'];
  expiredAt?: string | null;
}): FixtureEmployer {
  const admins: AdminCompanyContact[] = [{
    name: input.adminName,
    email: input.adminEmail,
    phone: input.adminPhone,
    role: 'Company admin',
  }];
  const extra = input.extraAdmins || 0;
  for (let index = 0; index < extra; index++) {
    admins.push({
      name: `Admin ${index + 2}`,
      email: `admin${index + 2}@${input.slug}.example`,
      phone: null,
      role: 'Company admin',
    });
  }
  return {
    row: {
      companyId: input.companyId,
      companyName: input.companyName,
      slug: input.slug,
      openJobsCount: input.openJobsCount,
      createdAt: input.createdAt,
    },
    admins,
    planSlug: input.planSlug,
    subscriptionStatus: input.subscriptionStatus,
    cycle: input.cycle,
    mrr: input.mrr,
    chargeAmount: input.chargeAmount,
    startedAt: input.startedAt,
    periodEndOffset: input.periodEndOffset,
    videosUsed: input.videosUsed,
    charges: input.charges,
    planChange: input.planChange || null,
    expiredAt: input.expiredAt || null,
  };
}

function paymentCatalog(now: Date): AdminPaymentRow[] {
  const today = manilaYmd(now);
  const rows: AdminPaymentRow[] = [];
  FIXTURE_EMPLOYERS.forEach(account => {
    account.charges.forEach((charge, index) => {
      rows.push(paymentRow(account, addDays(today, -charge.offset), charge.status, index));
    });
  });
  return rows.sort((a, b) => b.paidAt.localeCompare(a.paidAt));
}

function paymentRow(account: FixtureEmployer, ymd: string, status: string, index: number): AdminPaymentRow {
  const stamp = ymd.replace(/-/g, '');
  return {
    paymentId: `PAY-${account.row.companyId}-${stamp}-${index}`,
    externalId: `pay_${account.row.companyId}_${stamp}_${index}f3c8`,
    companyId: account.row.companyId,
    companyName: account.row.companyName,
    planLabel: financePlanLabel(account.planSlug),
    paidAt: ymd,
    amount: account.chargeAmount,
    method: 'PayMongo',
    status,
  };
}

function subscriptionRow(account: FixtureEmployer, today: string, payments: AdminPaymentRow[]): AdminSubscriptionRow {
  const succeeded = payments
    .filter(row => row.companyId === account.row.companyId && row.status === 'succeeded')
    .map(row => row.paidAt)
    .sort();
  return {
    companyId: account.row.companyId,
    companyName: account.row.companyName,
    planSlug: account.planSlug,
    planLabel: financePlanLabel(account.planSlug),
    status: account.subscriptionStatus,
    cycle: account.cycle,
    periodEnd: addDays(today, account.periodEndOffset),
    mrr: account.subscriptionStatus === 'active' ? account.mrr : 0,
    lastPaymentAt: succeeded.length ? succeeded[succeeded.length - 1] : null,
  };
}

function planBreakdown(): AdminPlanBreakdown[] {
  const total = FIXTURE_EMPLOYERS.length || 1;
  return PLAN_BREAKDOWN_ORDER.map(plan => {
    const count = FIXTURE_EMPLOYERS.filter(account => planBucket(account.planSlug) === plan.slug).length;
    return {
      slug: plan.slug,
      label: plan.label,
      count,
      pct: Math.round((count / total) * 100),
    };
  });
}

function planBucket(slug: string): string {
  if (slug === 'free_trial' || slug === 'starter' || slug === 'growth' || slug === 'business') {
    return slug;
  }
  return 'other';
}

function entitlementMeters(account: FixtureEmployer): { label: string; used: number; limit: number | null }[] {
  const limits = ENTITLEMENT_LIMITS[account.planSlug] || { jobs: null, admins: null, videos: null };
  return [
    { label: 'Jobs', used: account.row.openJobsCount || 0, limit: limits.jobs },
    { label: 'Admins', used: account.admins.length, limit: limits.admins },
    { label: 'Videos', used: account.videosUsed, limit: limits.videos },
  ];
}

function sumAmounts(rows: AdminPaymentRow[]): number {
  return rows.reduce((total, row) => total + row.amount, 0);
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
