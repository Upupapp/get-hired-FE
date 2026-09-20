import { Component, NgZone, PLATFORM_ID } from '@angular/core';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Subscription } from 'rxjs';
import { environment } from 'environments/environment';
import {
  ENGAGEMENT_CONTEXT_RESPONSE, MESSAGE_ACTION_ERROR, MESSAGE_ACTION_NOT_FOUND, MESSAGE_ACTION_RESPONSE,
} from '../../../testing/engagement-contract.fixture';
import { DegradedPart, EngagementContext, EngagementContextResponse } from './engagement-contract.models';
import { EngagementRefreshBus } from './engagement-refresh.bus';
import { MessageActionOutcome, SubscriptionEngagementService } from './subscription-engagement.service';

@Component({ template: '' })
class BlankComponent {}

const CONTEXT_URL = `${environment.api_url}/subscriptions/engagement/context`;
const NOTIFICATIONS_URL = `${environment.api_url}/subscriptions/notifications`;

function served(): EngagementContextResponse {
  return JSON.parse(JSON.stringify(ENGAGEMENT_CONTEXT_RESPONSE));
}

/**
 * F1: the engagement context is read once per navigation inside the employer shell and shared,
 * read again on request, never on the server, and a failure or a degraded part renders nothing.
 */
describe('SubscriptionEngagementService (F1)', () => {
  let http: HttpTestingController;
  let router: Router;
  let zone: NgZone;
  let bus: EngagementRefreshBus;
  let subscriptions: Subscription[];

  function setUp(platform: 'browser' | 'server'): SubscriptionEngagementService {
    TestBed.configureTestingModule({
      declarations: [BlankComponent],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([
          { path: 'recruiter/dashboard', component: BlankComponent },
          { path: 'recruiter/jobs/list', component: BlankComponent },
          { path: 'recruiter/company/settings', component: BlankComponent },
          { path: 'user/home', component: BlankComponent },
        ]),
      ],
      providers: [{ provide: PLATFORM_ID, useValue: platform }],
    });
    http = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    zone = TestBed.inject(NgZone);
    bus = TestBed.inject(EngagementRefreshBus);
    subscriptions = [];
    return TestBed.inject(SubscriptionEngagementService);
  }

  function go(url: string): void {
    zone.run(() => { router.navigateByUrl(url); });
    tick();
  }

  function watch(service: SubscriptionEngagementService): Array<EngagementContext | null> {
    const seen: Array<EngagementContext | null> = [];
    subscriptions.push(service.context$.subscribe(value => seen.push(value)));
    return seen;
  }

  afterEach(() => {
    (subscriptions || []).forEach(s => s.unsubscribe());
    http.verify();
  });

  it('reads the context once per navigation inside the employer shell, and every subscriber shares that one read', fakeAsync(() => {
    const service = setUp('browser');
    go('/recruiter/dashboard');
    const first = watch(service);
    const second = watch(service);
    http.expectOne(CONTEXT_URL).flush(served());

    go('/recruiter/jobs/list');
    http.expectOne(CONTEXT_URL).flush(served());

    go('/recruiter/company/settings?tab=3');
    http.expectOne(CONTEXT_URL).flush(served());

    expect(first.length).toBe(6);
    expect(second.length).toBe(6);
    expect(first[1]!.generatedAt).toBe(ENGAGEMENT_CONTEXT_RESPONSE.context.generatedAt);
  }));

  it('reads nothing outside the employer shell, even on a refresh request', fakeAsync(() => {
    const service = setUp('browser');
    go('/user/home');
    const seen = watch(service);
    bus.request('bell_read');
    http.expectNone(CONTEXT_URL);
    expect(seen).toEqual([null, null]);

    go('/recruiter/dashboard');
    http.expectOne(CONTEXT_URL).flush(served());
    expect(seen.length).toBe(4);
  }));

  it('clears cached alerts and cancels pending context reads when leaving the employer shell', fakeAsync(() => {
    const service = setUp('browser');
    go('/recruiter/dashboard');
    const seen = watch(service);
    http.expectOne(CONTEXT_URL).flush(served());
    go('/recruiter/jobs/list');
    const pending = http.expectOne(CONTEXT_URL);
    expect(seen[seen.length - 1]).toBeNull();
    go('/user/home');
    expect(pending.cancelled).toBeTrue();
    expect(seen[seen.length - 1]).toBeNull();
    const late = watch(service);
    expect(late).toEqual([null]);
    http.expectNone(CONTEXT_URL);
  }));

  it('reads nothing on the server platform, and gives null', fakeAsync(() => {
    const service = setUp('server');
    go('/recruiter/dashboard');
    const seen = watch(service);
    bus.request('checkout_return');
    go('/recruiter/jobs/list');
    http.expectNone(CONTEXT_URL);
    expect(seen).toEqual([null]);
  }));

  it('a 403, a 500, a network error and a 200 without success each give null, and the next navigation reads again', fakeAsync(() => {
    const service = setUp('browser');
    go('/recruiter/dashboard');
    const seen = watch(service);
    http.expectOne(CONTEXT_URL).flush({ message: 'No company context.' }, { status: 403, statusText: 'Forbidden' });

    go('/recruiter/jobs/list');
    http.expectOne(CONTEXT_URL).flush({ success: false, message: "We couldn't load subscription messages. Please try again." }, { status: 500, statusText: 'Server Error' });

    go('/recruiter/company/settings');
    http.expectOne(CONTEXT_URL).error(new ProgressEvent('error'));

    go('/recruiter/dashboard');
    http.expectOne(CONTEXT_URL).flush({ success: false });

    go('/recruiter/jobs/list');
    http.expectOne(CONTEXT_URL).flush(served());

    expect(seen.slice(0, 9)).toEqual(Array(9).fill(null));
    expect(seen[9]!.status).toBe('ok');
  }));

  const EMPTIED: Record<DegradedPart, (c: EngagementContext) => void> = {
    subscription: c => expect(c.subscription).toBeNull(),
    usage: c => expect(c.usage).toEqual({}),
    messages: c => {
      expect(c.prominent).toBeNull();
      expect(c.secondary).toEqual([]);
      expect(c.banner).toBeNull();
      expect(c.dashboardCard).toBeNull();
    },
    unreadCounts: c => expect(c.unreadCounts).toBeNull(),
  };
  const PART_FIELDS: Record<DegradedPart, Array<keyof EngagementContext>> = {
    subscription: ['subscription'],
    usage: ['usage'],
    messages: ['prominent', 'secondary', 'banner', 'dashboardCard'],
    unreadCounts: ['unreadCounts'],
  };

  (Object.keys(EMPTIED) as DegradedPart[]).forEach(part => {
    it(`a degraded "${part}" part gives nothing for that part and leaves the others as served`, fakeAsync(() => {
      const service = setUp('browser');
      go('/recruiter/dashboard');
      const seen = watch(service);
      const body = served();
      body.context.status = 'degraded';
      body.context.degraded = [part];
      http.expectOne(CONTEXT_URL).flush(body);

      const context = seen[1]!;
      EMPTIED[part](context);
      (Object.keys(PART_FIELDS) as DegradedPart[]).filter(other => other !== part).forEach(other => {
        PART_FIELDS[other].forEach(field => expect(context[field]).withContext(field).toEqual(served().context[field]));
      });
    }));
  });

  it('a refresh request inside the shell reads the context again, once', fakeAsync(() => {
    const service = setUp('browser');
    go('/recruiter/dashboard');
    const seen = watch(service);
    http.expectOne(CONTEXT_URL).flush(served());

    bus.request('member_removed');
    http.expectOne(CONTEXT_URL).flush(served());
    expect(seen.length).toBe(4);
  }));

  it('found: false from dismiss is an answer, not an error: not_found, and the context is read again', fakeAsync(() => {
    const service = setUp('browser');
    go('/recruiter/dashboard');
    watch(service);
    http.expectOne(CONTEXT_URL).flush(served());

    const outcomes: MessageActionOutcome[] = [];
    let failed = false;
    service.dismiss('nudge:storage.80').subscribe({ next: o => outcomes.push(o), error: () => { failed = true; } });
    const req = http.expectOne(`${NOTIFICATIONS_URL}/nudge%3Astorage.80/dismiss`);
    expect(req.request.method).toBe('POST');
    req.flush(MESSAGE_ACTION_NOT_FOUND);

    expect(failed).toBeFalse();
    expect(outcomes).toEqual([{ outcome: 'not_found' }]);
    http.expectOne(CONTEXT_URL).flush(served());
  }));

  it('a dismiss that applied gives its status and reads the context again; 409 NOT_DISMISSIBLE refuses and reads nothing', fakeAsync(() => {
    const service = setUp('browser');
    go('/recruiter/dashboard');
    watch(service);
    http.expectOne(CONTEXT_URL).flush(served());

    const outcomes: MessageActionOutcome[] = [];
    service.dismiss('nudge:storage.80').subscribe(o => outcomes.push(o));
    http.expectOne(`${NOTIFICATIONS_URL}/nudge%3Astorage.80/dismiss`).flush(MESSAGE_ACTION_RESPONSE);
    http.expectOne(CONTEXT_URL).flush(served());

    service.dismiss('SUBN-42').subscribe(o => outcomes.push(o));
    http.expectOne(`${NOTIFICATIONS_URL}/SUBN-42/dismiss`).flush(MESSAGE_ACTION_ERROR, { status: 409, statusText: 'Conflict' });
    http.expectNone(CONTEXT_URL);

    expect(outcomes).toEqual([
      { outcome: 'applied', status: 'DISMISSED' },
      { outcome: 'refused', httpStatus: 409, code: 'NOT_DISMISSIBLE', message: MESSAGE_ACTION_ERROR.message },
    ]);
  }));

  it('a click posts the intent and reads the context again; 400 INVALID_INTENT refuses and reads nothing', fakeAsync(() => {
    const service = setUp('browser');
    go('/recruiter/dashboard');
    watch(service);
    http.expectOne(CONTEXT_URL).flush(served());

    const outcomes: MessageActionOutcome[] = [];
    service.click('nudge:jobs.full', 'MANAGE_JOBS').subscribe(o => outcomes.push(o));
    const req = http.expectOne(`${NOTIFICATIONS_URL}/nudge%3Ajobs.full/click`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ intent: 'MANAGE_JOBS' });
    req.flush({ success: true, found: true, status: 'CLICKED' });
    http.expectOne(CONTEXT_URL).flush(served());

    service.click('nudge:jobs.full', 'VIEW_PLAN').subscribe(o => outcomes.push(o));
    http.expectOne(`${NOTIFICATIONS_URL}/nudge%3Ajobs.full/click`)
      .flush({ success: false, code: 'INVALID_INTENT', message: 'That action is not offered.' }, { status: 400, statusText: 'Bad Request' });
    http.expectNone(CONTEXT_URL);

    expect(outcomes).toEqual([
      { outcome: 'applied', status: 'CLICKED' },
      { outcome: 'refused', httpStatus: 400, code: 'INVALID_INTENT', message: 'That action is not offered.' },
    ]);
  }));
});
