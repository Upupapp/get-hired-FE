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

export interface AdminPlanBreakdown {
  slug: string;
  plan: string;
  count: number;
  mrr: number;
}

export interface AdminRevenuePoint {
  date: string;
  amount: number;
}

export interface AdminSubscriptionRow {
  subscriptionId: string;
  companyId: string;
  companyName: string;
  plan: string;
  planSlug: string;
  status: string;
  mrr: number;
  startedAt: string | null;
  renewsAt: string | null;
}

export interface AdminPaymentRow {
  paymentId: string;
  invoiceId: string;
  companyId: string;
  companyName: string;
  paidAt: string;
  amount: number;
  method: string;
  status: string;
}

export interface AdminFinanceQuery {
  range?: string;
  from?: string;
  to?: string;
  q?: string;
  companyId?: string;
  page: number;
  pageSize: number;
  paymentPage: number;
}

/**
 * Subscription counts and MRR are a current snapshot.
 * Revenue fields follow the time filter, and the company id when Finance is filtered.
 */
export interface AdminFinance {
  currency: string;
  activeCount: number;
  canceledCount: number;
  trialCount: number;
  mrr: number;
  plans: AdminPlanBreakdown[];
  from: string | null;
  to: string | null;
  revenueInRange: number;
  revenuePrevious: number;
  revenueSeries: AdminRevenuePoint[];
  subscriptions: AdminPage<AdminSubscriptionRow>;
  payments: AdminPage<AdminPaymentRow>;
  companyId: string | null;
  companyName: string | null;
  fromFixture: boolean;
}

export interface AdminCompanyContact {
  name: string;
  email: string;
  phone: string | null;
  role: string;
}

export interface AdminCompanyEvent {
  at: string;
  kind: string;
  summary: string;
}

export interface AdminCompanySubscription {
  plan: string;
  planSlug: string;
  status: string;
  mrr: number;
  startedAt: string | null;
  renewsAt: string | null;
}

export interface AdminCompanyDetail {
  companyId: string;
  companyName: string;
  slug: string;
  createdAt: string | null;
  openJobsCount: number | null;
  status: string | null;
  adminContact: AdminCompanyContact | null;
  contacts: AdminCompanyContact[];
  subscription: AdminCompanySubscription | null;
  payments: AdminPaymentRow[];
  history: AdminCompanyEvent[];
  fromFixture: boolean;
}
