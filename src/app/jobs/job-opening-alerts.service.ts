import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { BaseService } from '@main/core/services/base.service';

/** Active subscriptions a seeker can hold. The API enforces this; the page only mirrors it. */
export const JOB_OPENING_ALERT_LIMIT = 30;

/**
 * Jobseeker role in this app's guards and local session (`AuthGuard` data.role,
 * `localStorage.role`). Admin is `1`, employer/recruiter is `2`.
 */
export const JOB_SEEKER_ROLE = '3';

export const JOB_OPENING_ALERTS_SEEKER_ONLY_MESSAGE =
  'Job opening alerts are only available to job seekers.';

export function isJobSeekerRole(role: string | number | null | undefined): boolean {
  return String(role) === JOB_SEEKER_ROLE;
}

/** Guests can see the CTA (it sends them to sign in). Signed-in employers and admins cannot. */
export function jobAlertEntryVisible(): boolean {
  if (!hasJobAlertSession()) return true;
  if (typeof localStorage === 'undefined') return false;
  return isJobSeekerRole(localStorage.getItem('role'));
}

export interface JobOpeningAlertSubscription {
  id: string | number;
  position: string;
  jobRoleId: number | null;
  active: boolean;
  instantSentAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface JobOpeningAlertCreateResult {
  subscription: JobOpeningAlertSubscription | null;
  /** True when the API created the subscription (201). False when it already existed (200). */
  created: boolean;
}

export function normalizeJobRoleId(value: number | string | null | undefined): number | undefined {
  if (value == null || value === '') return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return undefined;
  return parsed;
}

/** Login return target that prefills the manage page after sign-in. */
export function buildJobAlertsReturnUrl(position: string, jobRoleId?: number | string | null): string {
  const query = [`position=${encodeURIComponent(position.trim())}`];
  const roleId = normalizeJobRoleId(jobRoleId);
  if (roleId != null) query.push(`jobRoleId=${encodeURIComponent(String(roleId))}`);
  return `/job-alerts?${query.join('&')}`;
}

export function hasJobAlertSession(): boolean {
  if (typeof localStorage === 'undefined') return false;
  return localStorage.getItem('state') === 'true' && !!localStorage.getItem('token');
}

function text(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function messageFromBody(body: any): string | null {
  if (!body || typeof body !== 'object') return null;
  const errorField = body.error;
  return text(errorField)
    || (errorField && typeof errorField === 'object' ? text(errorField.message) : null)
    || text(body.message);
}

export function isJobOpeningAlertForbidden(err: any): boolean {
  return !!(err && err.status === 403);
}

/** Prefer the API envelope message over Angular's generic HTTP failure text. */
export function jobOpeningAlertErrorMessage(err: any): string {
  if (isJobOpeningAlertForbidden(err)) return JOB_OPENING_ALERTS_SEEKER_ONLY_MESSAGE;
  const fromEnvelope = messageFromBody(err && err.error) || messageFromBody(err);
  if (fromEnvelope && fromEnvelope.indexOf('Http failure') !== 0) return fromEnvelope;
  return 'Something went wrong with job alerts. Please try again.';
}

function asSubscription(raw: any): JobOpeningAlertSubscription | null {
  if (!raw || typeof raw !== 'object') return null;
  const id = raw.id != null ? raw.id : raw.subscriptionId;
  const position = text(raw.position);
  if (id == null || !position) return null;
  const roleId = normalizeJobRoleId(raw.jobRoleId != null ? raw.jobRoleId : raw.job_role_id);
  return {
    id,
    position,
    jobRoleId: roleId == null ? null : roleId,
    active: raw.active !== false,
    instantSentAt: text(raw.instantSentAt) || text(raw.instant_sent_at),
    createdAt: text(raw.createdAt) || text(raw.created_at),
    updatedAt: text(raw.updatedAt) || text(raw.updated_at),
  };
}

export function subscriptionsFromEnvelope(body: any): JobOpeningAlertSubscription[] {
  const data = body && body.data !== undefined ? body.data : body;
  const list = Array.isArray(data)
    ? data
    : (data && (data.subscriptions || data.items)) || [];
  return list
    .map((item: any) => asSubscription(item))
    .filter((item: JobOpeningAlertSubscription | null): item is JobOpeningAlertSubscription => !!item);
}

export function subscriptionFromEnvelope(body: any): JobOpeningAlertSubscription | null {
  const data = body && body.data !== undefined ? body.data : body;
  if (!data) return null;
  if (data.subscription) return asSubscription(data.subscription);
  if (Array.isArray(data.subscriptions) && data.subscriptions.length === 1) {
    return asSubscription(data.subscriptions[0]);
  }
  return asSubscription(data);
}

function assertSuccess(body: any): void {
  if (body && body.status === 'error') {
    throw { error: body };
  }
}

@Injectable({
  providedIn: 'root',
})
export class JobOpeningAlertsService {
  private readonly url = `${environment.api_url}/job-opening-alerts`;

  constructor(private baseService: BaseService) {}

  list(): Observable<JobOpeningAlertSubscription[]> {
    return this.baseService.get<any>(this.url).pipe(
      map((body) => {
        assertSuccess(body);
        return subscriptionsFromEnvelope(body).filter((item) => item.active);
      }),
    );
  }

  create(position: string, jobRoleId?: number | null): Observable<JobOpeningAlertCreateResult> {
    const payload: { position: string; jobRoleId?: number } = { position: position.trim() };
    const roleId = normalizeJobRoleId(jobRoleId);
    if (roleId != null) payload.jobRoleId = roleId;

    return this.baseService.post(this.url, payload, { observe: 'response' }).pipe(
      map((res: any) => {
        const body = res && res.body !== undefined ? res.body : res;
        assertSuccess(body);
        const status = res && typeof res.status === 'number' ? res.status : 200;
        return {
          subscription: subscriptionFromEnvelope(body),
          created: status === 201,
        };
      }),
    );
  }

  unsubscribe(id: string | number): Observable<void> {
    const target = `${this.url}/${encodeURIComponent(String(id))}`;
    return this.baseService.delete<any>(target).pipe(
      map((body) => {
        assertSuccess(body);
        return undefined;
      }),
    );
  }
}
