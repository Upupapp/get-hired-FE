import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from 'environments/environment';
import { MESSAGE_ACTION_NOT_FOUND, MESSAGE_ACTION_RESPONSE, NOTIFICATION_LIST_RESPONSE } from '../../../../testing/engagement-contract.fixture';
import { MessageActionResult, NotificationListResponse } from '@main/shared/engagement/engagement-contract.models';
import { SubscriptionLifecycleService } from './subscription-lifecycle.service';

const URL = `${environment.api_url}/subscriptions/notifications`;

/** F1: the subscription notification methods speak the E2 contract (string ids, `found`, the list's query and paging). */
describe('SubscriptionLifecycleService -- notifications, per the E2 contract (F1)', () => {
  let service: SubscriptionLifecycleService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule], providers: [SubscriptionLifecycleService] });
    service = TestBed.inject(SubscriptionLifecycleService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lists with no query by default, so the backend defaults apply (UNREAD, both categories, page 1, 20)', () => {
    let result: NotificationListResponse | undefined;
    service.getNotifications().subscribe(r => { result = r; });
    const req = http.expectOne(r => r.url === URL);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.keys()).toEqual([]);
    req.flush(NOTIFICATION_LIST_RESPONSE);
    expect(result!.notifications.map(n => n.id)).toEqual(['NOTIF-26-48213907', 'SUBN-42']);
    expect(result!.hasMore).toBeFalse();
  });

  it('sends status, comma-separated categories and priorities, page and limit', () => {
    service.getNotifications({ status: 'ALL', category: ['SUBSCRIPTION', 'BILLING'], priority: ['HIGH', 'CRITICAL'], source: ['payment'], page: 2, limit: 50 }).subscribe();
    const req = http.expectOne(r => r.url === URL);
    expect(req.request.params.get('status')).toBe('ALL');
    expect(req.request.params.get('source')).toBe('payment');
    expect(req.request.params.get('category')).toBe('SUBSCRIPTION,BILLING');
    expect(req.request.params.get('priority')).toBe('HIGH,CRITICAL');
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('limit')).toBe('50');
    req.flush(NOTIFICATION_LIST_RESPONSE);
  });

  it('marks a string id read, and found: false arrives as an answer, not an error', () => {
    const answers: MessageActionResult[] = [];
    let failed = false;
    service.markNotificationRead('SUBN-42').subscribe({ next: a => answers.push(a), error: () => { failed = true; } });
    const req = http.expectOne(`${URL}/SUBN-42/read`);
    expect(req.request.method).toBe('POST');
    req.flush(MESSAGE_ACTION_NOT_FOUND);
    expect(failed).toBeFalse();
    expect(answers).toEqual([{ success: true, found: false }]);
  });

  it('dismisses by POST, with a context id encoded into the path', () => {
    service.dismissNotification('nudge:storage.80').subscribe();
    const req = http.expectOne(`${URL}/nudge%3Astorage.80/dismiss`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({});
    req.flush(MESSAGE_ACTION_RESPONSE);
  });

  it('records a click by POST with the chosen intent', () => {
    service.clickNotification('NOTIF-26-48213907', 'COMPARE_PLANS').subscribe();
    const req = http.expectOne(`${URL}/NOTIF-26-48213907/click`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ intent: 'COMPARE_PLANS' });
    req.flush({ success: true, found: true, status: 'CLICKED' });
  });
});
