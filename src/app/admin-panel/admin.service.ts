import { Injectable } from '@angular/core';
import { BaseService } from '@main/core/services/base.service';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as Model from './admin.model';
import { buildAdminQuery, normalizeCompany, normalizeJob, normalizePage, normalizeUser } from './admin.normalize';

/**
 * List calls use the admin MVP query names: q, role, status, page, pageSize.
 * Responses may be `{ data: { items, total, page, pageSize } }` or the page itself.
 * Job status filters are draft | published | expired | archived.
 * Unpublish is a soft hide: POST /admin/jobs/:jobId/unpublish. It does not delete.
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

  getDashboardDetails() {
    return this.baseService.get<any>(`${this.adminUrl}/dashboard`);
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
      map(res => normalizePage(res, normalizeUser, query.page, query.pageSize))
    );
  }

  listJobs(query: Model.AdminJobQuery): Observable<Model.AdminPage<Model.AdminJobRow>> {
    const url = `${this.adminUrl}/jobs${buildAdminQuery({
      q: query.q,
      status: query.status,
      page: query.page,
      pageSize: query.pageSize,
    })}`;
    return this.baseService.get<any>(url).pipe(
      map(res => normalizePage(res, normalizeJob, query.page, query.pageSize))
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
      map(res => normalizePage(res, normalizeCompany, query.page, query.pageSize))
    );
  }

  getVerificationLink(email: string) {
    return this.baseService.post<any>(`${this.authUrl}/getverificationlink?email=${encodeURIComponent(email)}`);
  }
}
