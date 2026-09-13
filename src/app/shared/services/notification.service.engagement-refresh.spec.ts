import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from 'environments/environment';
import { BaseService } from '@main/core/services/base.service';
import { EngagementRefreshBus } from '@main/shared/engagement/engagement-refresh.bus';
import { NotificationService } from './notification.service';

const URL = `${environment.api_url}/notifications`;

/** F1, D5: a bell read or delete changes the unread counts, so the engagement context is read again. */
describe('NotificationService -- a bell read or delete reads the engagement context again (F1, D5)', () => {
  let service: NotificationService;
  let http: HttpTestingController;
  let bus: EngagementRefreshBus;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule], providers: [BaseService, NotificationService] });
    service = TestBed.inject(NotificationService);
    http = TestBed.inject(HttpTestingController);
    bus = TestBed.inject(EngagementRefreshBus);
    spyOn(bus, 'request');
  });

  afterEach(() => http.verify());

  it('a bell row read: one refresh request', () => {
    service.markRead('NOTIF-26-48213907').subscribe();
    http.expectOne(`${URL}/NOTIF-26-48213907/read`).flush({ status: 'success', data: { found: true } });
    expect((bus.request as jasmine.Spy).calls.allArgs()).toEqual([['bell_read']]);
  });

  it('every bell row read: one refresh request', () => {
    service.markAllRead().subscribe();
    http.expectOne(`${URL}/read-all`).flush({ status: 'success', data: { updatedCount: 2 } });
    expect((bus.request as jasmine.Spy).calls.allArgs()).toEqual([['bell_read']]);
  });

  it('a bell row deleted (an engine message is dismissed): one refresh request', () => {
    service.delete('NOTIF-26-48213907').subscribe();
    http.expectOne(`${URL}/NOTIF-26-48213907`).flush({ status: 'success', data: { found: true, dismissed: true } });
    expect((bus.request as jasmine.Spy).calls.allArgs()).toEqual([['bell_dismissed']]);
  });

  it('a read that failed, and a CRITICAL delete refused with 409: no refresh request', () => {
    service.markRead('NOTIF-26-1').subscribe({ error: () => {} });
    http.expectOne(`${URL}/NOTIF-26-1/read`).flush({ status: 'error' }, { status: 500, statusText: 'Server Error' });
    service.delete('NOTIF-26-2').subscribe({ error: () => {} });
    http.expectOne(`${URL}/NOTIF-26-2`).flush({ status: 'error', error: 'This message stays until the issue is resolved.' }, { status: 409, statusText: 'Conflict' });
    expect(bus.request).not.toHaveBeenCalled();
  });
});
