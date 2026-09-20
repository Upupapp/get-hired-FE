import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router, NavigationEnd } from '@angular/router';
import { defer, merge, Observable, of } from 'rxjs';
import { catchError, filter, map, shareReplay, startWith, switchMap, tap } from 'rxjs/operators';
import { environment } from 'environments/environment';
import { SubscriptionLifecycleService } from '@main/employer-panel/employer-subscription/services/subscription-lifecycle.service';
import { EngagementRefreshBus } from './engagement-refresh.bus';
import { SubscriptionEngagementService, MessageActionOutcome, inEmployerShell } from './subscription-engagement.service';
import { CtaAction, CtaIntent, EngagementContext, Nudge } from './engagement-contract.models';
import { EmployerAction, EmployerContextResponse, EmployerInteractionResponse, EmployerMessage, EmployerRecommendation } from './employer-engagement.models';

/** A route must have a destination before a server CTA is offered. No external redirects. */
export function employerAction(action: EmployerAction): CtaAction | null {
  if (!action || action.action !== 'NAVIGATE' || !action.label || typeof action.url !== 'string') { return null; }
  const path = action.url.split(/[?#]/)[0];
  const destinations = ['/recruiter/dashboard', '/recruiter/jobs', '/recruiter/jobs/list', '/recruiter/company/settings', '/recruiter/subscription', '/recruiter/subscription/storage', '/recruiter/subscription/enterprise', '/recruiter/applicants'];
  if (destinations.indexOf(path) === -1 && !/^\/recruiter\/subscription\/upgrade\/[a-z][a-z_]*$/.test(path)) { return null; }
  return { ...action, type: action.type || 'PRIMARY' };
}

/** The raw DTO stays intact on the wire. This adapter reuses the established display components. */
export function employerNudge(message: EmployerMessage | null): Nudge | null {
  if (!message || !message.copy?.title) { return null; }
  const metric = message.trigger.split('.')[0];
  const meter = metric === 'storage' ? 'storage' : metric === 'users' ? 'seats' : 'jobs';
  const actions = (message.actions || []).map(employerAction).filter((action): action is CtaAction => !!action);
  return {
    id: message.id, kind: message.kind as Nudge['kind'], trigger: message.trigger, ruleKey: message.trigger,
    meter, priority: message.priority, messageClass: message.kind === 'PLAN_UPGRADE' ? 'EXPANSION' : 'OPERATIONAL',
    presentation: { recommendedSurface: message.presentation.recommendedSurface as any, surfaces: [message.presentation.recommendedSurface as any], dismissible: !!message.id && message.presentation.dismissible },
    copy: message.copy, usage: message.usage ? { ...message.usage, status: null } : null,
    recommendation: message.recommendation ? { currentPlan: message.recommendation.currentPlan || '', targetPlan: message.recommendation.recommendedPlan, targetPlanName: null, reason: message.recommendation.reasonCodes.join(', ') as any, benefit: null } : null,
    escalation: null, actions,
  };
}
export function employerContext(response: EmployerContextResponse): EngagementContext | null {
  if (!response || response.success !== true || response.availability === 'PENDING_EVALUATION') { return null; }
  const banner = employerNudge(response.banner);
  const card = banner ? null : employerNudge(response.dashboardCard);
  return { status: 'ok', degraded: [], generatedAt: '', subscription: null, usage: {}, prominent: banner || card, secondary: [], banner, dashboardCard: card, unreadCounts: null,
    capabilities: { features: {}, flags: { storageWarnings: false, storageAddOns: false, featureGateUpgrade: false, enterpriseSignals: false } } };
}

/** Employer-shell override: legacy V4 remains available outside this provider. */
@Injectable()
export class EmployerEngagementAdapter extends SubscriptionEngagementService {
  readonly context$: Observable<EngagementContext | null>;
  private readonly employerBase = environment.api_url + '/employer';
  private readonly seenIds = new Set<string>();
  constructor(private employerHttp: HttpClient, private employerRouter: Router, lifecycle: SubscriptionLifecycleService,
    private employerRefresh: EngagementRefreshBus, @Inject(PLATFORM_ID) platformId: object) {
    super(employerHttp, employerRouter, lifecycle, employerRefresh, platformId);
    if (!isPlatformBrowser(platformId)) { this.context$ = of(null); return; }
    const navigation$ = defer(() => {
      const ends$ = employerRouter.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd), map(e => e.urlAfterRedirects));
      return employerRouter.navigated ? ends$.pipe(startWith(employerRouter.url)) : ends$;
    });
    this.context$ = merge(navigation$, employerRefresh.requests$.pipe(map(() => employerRouter.url))).pipe(
      switchMap(url => inEmployerShell(url) ? employerHttp.get<EmployerContextResponse>(this.employerBase + '/engagement/context').pipe(map(employerContext), catchError(() => of(null)), startWith(null)) : of(null)),
      shareReplay({bufferSize: 1, refCount: true}),
    );
  }
  refresh(): void { this.employerRefresh.request('account_refresh'); }
  dismiss(id: string): Observable<MessageActionOutcome> { return this.interact(id, 'dismiss'); }
  click(id: string, _intent?: CtaIntent): Observable<MessageActionOutcome> { return this.interact(id, 'click'); }
  seen(id: string): void {
    if (!id || this.seenIds.has(id)) { return; }
    this.seenIds.add(id);
    this.employerHttp.post(this.employerBase + '/notifications/' + encodeURIComponent(id) + '/seen', {}).subscribe({ error: () => {} });
  }
  recommendation(): Observable<EmployerRecommendation | null> {
    return this.employerHttp.get<{success: boolean; recommendation: EmployerRecommendation}>(this.employerBase + '/subscription/recommendation').pipe(
      map(r => r.success === true && r.recommendation?.eligible === true && r.recommendation.recommendedPlan ? r.recommendation : null), catchError(() => of(null)),
    );
  }
  private interact(id: string, action: 'dismiss' | 'click'): Observable<MessageActionOutcome> {
    if (!id) { return of({ outcome: 'not_found' }); }
    const url = this.employerBase + '/notifications/' + encodeURIComponent(id) + '/' + action;
    const request$ = action === 'dismiss' ? this.employerHttp.patch<EmployerInteractionResponse>(url, {}) : this.employerHttp.post<EmployerInteractionResponse>(url, {});
    return request$.pipe(map((r): MessageActionOutcome => r.success === true && r.updated === true ? {outcome: 'applied', status: action === 'dismiss' ? 'DISMISSED' : 'CLICKED'} : {outcome: 'refused', httpStatus: 400, code: null, message: null}),
      tap(r => { if (r.outcome === 'applied') { this.refresh(); } }),
      catchError((e: HttpErrorResponse) => of({outcome: 'refused', httpStatus: e.status, code: null, message: null} as MessageActionOutcome)),
    );
  }
}
