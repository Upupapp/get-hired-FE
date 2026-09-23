export interface Admin {

}

/** KPI payload from GET /admin/dashboard. Null means the field was absent. */
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
}

export interface User {

}

export interface AdminPage<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
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
