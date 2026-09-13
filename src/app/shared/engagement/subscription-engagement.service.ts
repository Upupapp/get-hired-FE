import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { NavigationEnd, Router } from '@angular/router';
import { Observable, defer, merge, of } from 'rxjs';
import { catchError, filter, map, shareReplay, startWith, switchMap, tap } from 'rxjs/operators';
import { environment } from 'environments/environment';
import { SubscriptionLifecycleService } from '@main/employer-panel/employer-subscription/services/subscription-lifecycle.service';
import { EngagementRefreshBus, EngagementRefreshReason } from './engagement-refresh.bus';
import {
  CtaIntent, EngagementContext, EngagementContextResponse, EngagementErrorCode, MessageActionResult, NotificationStatus,
} from './engagement-contract.models';

/** The employer shell's routes. The context is only read while the viewer is inside them. */
export const EMPLOYER_SHELL_PATH = '/recruiter';

export function inEmployerShell(url: string | null | undefined): boolean {
  const path = String(url || '').split(/[?#]/)[0];
  return path === EMPLOYER_SHELL_PATH || path.indexOf(EMPLOYER_SHELL_PATH + '/') === 0;
}

/**
 * A degraded part renders as nothing, whatever the response carried for it (contract §3.1, §7.8).
 * The backend already sends such a part as null or empty; this keeps the frontend from guessing
 * if it ever does not.
 */
export function withoutDegradedParts(context: EngagementContext): EngagementContext {
  const degraded = Array.isArray(context.degraded) ? context.degraded : [];
  if (degraded.length === 0) { return context; }
  const out: EngagementContext = { ...context };
  if (degraded.indexOf('subscription') !== -1) { out.subscription = null; }
  if (degraded.indexOf('usage') !== -1) { out.usage = {}; }
  if (degraded.indexOf('messages') !== -1) {
    out.prominent = null;
    out.secondary = [];
    out.banner = null;
    out.dashboardCard = null;
  }
  if (degraded.indexOf('unreadCounts') !== -1) { out.unreadCounts = null; }
  return out;
}

/**
 * How a dismiss or click ended. `not_found` is a 200 answer, not a failure. A refusal (400
 * INVALID_INTENT, 409 NOT_DISMISSIBLE, 503 NOTIFICATIONS_UNAVAILABLE) leaves the message as it was.
 */
export type MessageActionOutcome =
  | { outcome: 'applied'; status: NotificationStatus }
  | { outcome: 'not_found' }
  | { outcome: 'refused'; httpStatus: number; code: EngagementErrorCode | null; message: string | null };

/**
 * The engagement context for the employer shell (contract §3.1), and the message actions that
 * change it. Rendering is F2 onwards; this service decides nothing a message shows.
 */
@Injectable({ providedIn: 'root' })
export class SubscriptionEngagementService {
  /**
   * The context for the page the viewer is on, or null when there is nothing to render: outside the
   * employer shell, on the server, or when the read failed (401, 403 "No company context.", 500, a
   * network error). One request per navigation inside the shell, shared by every subscriber, and one
   * per refresh request. Nothing is read while nothing subscribes.
   */
  readonly context$: Observable<EngagementContext | null>;

  private readonly base = environment.api_url;

  constructor(
    private http: HttpClient,
    private router: Router,
    private lifecycle: SubscriptionLifecycleService,
    private refreshBus: EngagementRefreshBus,
    @Inject(PLATFORM_ID) platformId: object,
  ) {
    if (!isPlatformBrowser(platformId)) {
      this.context$ = of(null);
      return;
    }
    const navigations$ = defer(() => {
      const ends$ = this.router.events.pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        map(event => event.urlAfterRedirects),
      );
      return this.router.navigated ? ends$.pipe(startWith(this.router.url)) : ends$;
    });
    const refreshes$ = this.refreshBus.requests$.pipe(map(() => this.router.url));
    this.context$ = merge(navigations$, refreshes$).pipe(
      filter(inEmployerShell),
      switchMap(() => this.readContext()),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
  }

  dismiss(id: string): Observable<MessageActionOutcome> {
    return this.settle(this.lifecycle.dismissNotification(id), 'message_dismissed');
  }

  /** Record the click; the caller then navigates to the action's own `url`. */
  click(id: string, intent: CtaIntent): Observable<MessageActionOutcome> {
    return this.settle(this.lifecycle.clickNotification(id, intent), 'message_clicked');
  }

  private readContext(): Observable<EngagementContext | null> {
    return this.http.get<EngagementContextResponse>(`${this.base}/subscriptions/engagement/context`).pipe(
      map(response => (response && response.success === true && response.context ? withoutDegradedParts(response.context) : null)),
      catchError(() => of(null)),
    );
  }

  private settle(request$: Observable<MessageActionResult>, reason: EngagementRefreshReason): Observable<MessageActionOutcome> {
    return request$.pipe(
      map((result): MessageActionOutcome => (result && result.found === true
        ? { outcome: 'applied', status: result.status }
        : { outcome: 'not_found' })),
      tap(() => this.refreshBus.request(reason)),
      catchError((err: HttpErrorResponse) => of(refusal(err))),
    );
  }
}

function refusal(err: HttpErrorResponse): MessageActionOutcome {
  const body = err && err.error && typeof err.error === 'object' ? err.error : {};
  return {
    outcome: 'refused',
    httpStatus: err && typeof err.status === 'number' ? err.status : 0,
    code: typeof body.code === 'string' ? body.code as EngagementErrorCode : null,
    message: typeof body.message === 'string' ? body.message : null,
  };
}
