import { Injectable } from '@angular/core';
import { BaseService } from '@main/core/services/base.service';
import { environment } from 'environments/environment';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import * as Model from './admin.model';
import { AdminTimeRange } from './admin-time';
import {
  ADMIN_USE_FIXTURES,
  applyDashboardFixture,
  fixtureApplications,
  fixtureCompanies,
  fixtureCompanyDetail,
  fixtureFinance,
  fixtureJobs,
  fixtureUsers,
} from './admin.fixtures';
import {
  buildAdminQuery,
  jobStatusQueryValue,
  normalizeApplication,
  normalizeCompany,
  normalizeCompanyDetail,
  normalizeDashboard,
  normalizeFinance,
  normalizeJob,
  normalizePage,
  normalizeUser,
} from './admin.normalize';

/**
 * List calls use the admin MVP query names: q, role, status, page, pageSize.
 * Responses may be `{ data: { items, total, page, pageSize } }` or the page itself.
 * Job status filters are draft | published | expired | archived in the UI.
 * Requests send job_status_id 1–4 (draft, published, expired, archived).
 * Unpublish is a soft hide: POST /admin/jobs/:jobId/unpublish. It does not delete.
 * Dashboard and list calls fall back to fixtures when the live call fails, except 401/403.
 */
@Injectable({
  providedIn: 'root',
})
export class AdminService {
  adminUrl = `${environment.api_url}/admin`;
  authUrl = `${environment.api_url}/auth`;

  constructor(private baseService: BaseService) { }

  getAdmin(userId: string) {
    return this.baseService.get<Model.Admin>(
      `${this.adminUrl}/profile?id=${userId}`
    );
  }

  getDashboardDetails(range: AdminTimeRange): Observable<Model.Dashboard | null> {
    const url = `${this.adminUrl}/dashboard${buildAdminQuery({
      range: range.preset,
      from: range.from,
      to: range.to,
    })}`;
    return this.baseService.get<any>(url).pipe(
      map(res => applyDashboardFixture(normalizeDashboard(res), range)),
      catchError(err => this.fixtureOrThrow(err, () => applyDashboardFixture(null, range)))
    );
  }

  userProfile(userId: string) {
    return this.baseService.get<any>(
      `${this.adminUrl}/userprofile?id=${encodeURIComponent(userId)}`
    );
  }

  listUsers(query: Model.AdminUserQuery): Observable<Model.AdminPage<Model.AdminUserRow>> {
    const url = `${this.adminUrl}/users${buildAdminQuery({
      q: query.q,
      role: query.role,
      page: query.page,
      pageSize: query.pageSize,
    })}`;
    return this.baseService.get<any>(url).pipe(
      map(res => normalizePage(res, normalizeUser, query.page, query.pageSize)),
      catchError(err => this.fixtureOrThrow(err, () => fixtureUsers(query)))
    );
  }

  listJobs(query: Model.AdminJobQuery): Observable<Model.AdminPage<Model.AdminJobRow>> {
    const url = `${this.adminUrl}/jobs${buildAdminQuery({
      q: query.q,
      status: jobStatusQueryValue(query.status),
      page: query.page,
      pageSize: query.pageSize,
    })}`;
    return this.baseService.get<any>(url).pipe(
      map(res => normalizePage(res, normalizeJob, query.page, query.pageSize)),
      catchError(err => this.fixtureOrThrow(err, () => fixtureJobs(query)))
    );
  }

  unpublishJob(jobId: string) {
    return this.baseService.post<any>(
      `${this.adminUrl}/jobs/${encodeURIComponent(jobId)}/unpublish`,
      {}
    );
  }

  listCompanies(query: Model.AdminListQuery): Observable<Model.AdminPage<Model.AdminCompanyRow>> {
    const url = `${this.adminUrl}/companies${buildAdminQuery({
      q: query.q,
      page: query.page,
      pageSize: query.pageSize,
    })}`;
    return this.baseService.get<any>(url).pipe(
      map(res => normalizePage(res, normalizeCompany, query.page, query.pageSize)),
      catchError(err => this.fixtureOrThrow(err, () => fixtureCompanies(query)))
    );
  }

  getFinance(query: Model.AdminFinanceQuery): Observable<Model.AdminFinance> {
    const url = `${this.adminUrl}/finance${buildAdminQuery({
      range: query.range,
      from: query.from,
      to: query.to,
      q: query.q,
      plan: query.plan,
      status: query.subscriptionStatus,
      payStatus: query.paymentStatus,
      page: query.page,
      pageSize: query.pageSize,
      payPage: query.paymentPage,
    })}`;
    return this.baseService.get<any>(url).pipe(
      map(res => {
        const live = normalizeFinance(res);
        if (live) {
          return live;
        }
        if (!ADMIN_USE_FIXTURES) {
          throw new Error('Finance was not in the response.');
        }
        return fixtureFinance(query);
      }),
      catchError(err => this.fixtureOrThrow(err, () => fixtureFinance(query)))
    );
  }

  getCompanyDetail(companyId: string): Observable<Model.AdminCompanyDetail> {
    const url = `${this.adminUrl}/companies/${encodeURIComponent(companyId)}`;
    return this.baseService.get<any>(url).pipe(
      map(res => {
        const live = normalizeCompanyDetail(res);
        if (live) {
          return live;
        }
        const sample = ADMIN_USE_FIXTURES ? fixtureCompanyDetail(companyId) : null;
        if (!sample) {
          throw new Error('Company detail was not in the response.');
        }
        return sample;
      }),
      catchError(err => this.fixtureOrThrow(err, () => fixtureCompanyDetail(companyId)))
    );
  }

  listApplications(query: Model.AdminApplicationQuery): Observable<Model.AdminPage<Model.AdminApplicationRow>> {
    const url = `${this.adminUrl}/applications${buildAdminQuery({
      q: query.q,
      from: query.from,
      to: query.to,
      page: query.page,
      pageSize: query.pageSize,
    })}`;
    return this.baseService.get<any>(url).pipe(
      map(res => normalizePage(res, normalizeApplication, query.page, query.pageSize)),
      catchError(err => this.fixtureOrThrow(err, () => fixtureApplications(query)))
    );
  }

  getVerificationLink(email: string) {
    return this.baseService.post<any>(`${this.authUrl}/getverificationlink?email=${encodeURIComponent(email)}`);
  }

  private fixtureOrThrow<T>(err: any, fixture: () => T | null): Observable<T> {
    if (!ADMIN_USE_FIXTURES || isAuthFailure(err)) {
      return throwError(() => err);
    }
    const sample = fixture();
    if (sample == null) {
      return throwError(() => err);
    }
    return of(sample);
  }
}

function isAuthFailure(err: any): boolean {
  return !!err && (err.status === 401 || err.status === 403);
}
