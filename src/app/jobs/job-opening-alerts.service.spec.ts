import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '@environments/environment';
import {
  JOB_ALERT_MODAL_SESSION_KEY,
  JobOpeningAlertsService,
  buildJobAlertsReturnUrl,
  buildJobsBrowseAlertReturnUrl,
  clearJobAlertModalIntent,
  jobAlertModalIntentPending,
  jobOpeningAlertErrorMessage,
  rememberJobAlertModalIntent,
  subscriptionsFromEnvelope,
} from './job-opening-alerts.service';

describe('JobOpeningAlertsService', () => {
  let service: JobOpeningAlertsService;
  let http: HttpTestingController;
  const url = `${environment.api_url}/job-opening-alerts`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(JobOpeningAlertsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.removeItem('returnURL');
    sessionStorage.removeItem(JOB_ALERT_MODAL_SESSION_KEY);
  });

  it('lists active subscriptions from the success envelope', () => {
    let rows: any[] = [];
    service.list().subscribe((result) => rows = result);

    const req = http.expectOne(url);
    expect(req.request.method).toBe('GET');
    req.flush({
      status: 'success',
      data: {
        subscriptions: [
          { id: 4, position: 'Nurse', jobRoleId: 9, active: true, instantSentAt: null },
          { id: 5, position: 'Old role', jobRoleId: null, active: false, instantSentAt: '2026-09-01T00:00:00.000Z' },
        ],
      },
    });

    expect(rows.length).toBe(1);
    expect(rows[0].position).toBe('Nurse');
    expect(rows[0].jobRoleId).toBe(9);
  });

  it('posts a position and reports a newly created subscription', () => {
    let created = false;
    service.create('Staff Nurse', 12).subscribe((result) => created = result.created);

    const req = http.expectOne(url);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ position: 'Staff Nurse', jobRoleId: 12 });
    req.flush({ status: 'success', data: { id: 8, position: 'Staff Nurse', jobRoleId: 12, active: true } }, { status: 201, statusText: 'Created' });
    expect(created).toBe(true);
  });

  it('treats an existing subscription as not newly created', () => {
    let created = true;
    service.create('Nurse').subscribe((result) => created = result.created);
    const req = http.expectOne(url);
    expect(req.request.body).toEqual({ position: 'Nurse' });
    req.flush({ status: 'success', data: { subscription: { id: 1, position: 'Nurse', active: true } } }, { status: 200, statusText: 'OK' });
    expect(created).toBe(false);
  });

  it('soft-unsubscribes by id', () => {
    let done = false;
    service.unsubscribe('abc/1').subscribe(() => done = true);
    const req = http.expectOne(`${url}/abc%2F1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ status: 'success', data: { id: 'abc/1', active: false } });
    expect(done).toBe(true);
  });

  it('surfaces the API error string, including the 30-position cap', () => {
    let message = '';
    service.create('Another').subscribe({ error: (err) => message = jobOpeningAlertErrorMessage(err) });
    http.expectOne(url).flush(
      { status: 'error', error: 'You can follow at most 30 positions.' },
      { status: 400, statusText: 'Bad Request' },
    );
    expect(message).toBe('You can follow at most 30 positions.');
  });

  it('reads a nested error message', () => {
    expect(jobOpeningAlertErrorMessage({
      error: { status: 'error', error: { message: 'Position is required', code: 'VALIDATION' } },
    })).toBe('Position is required');
  });

  it('uses a jobseeker-only message for HTTP 403 and does not echo Forbidden', () => {
    expect(jobOpeningAlertErrorMessage({
      status: 403,
      error: { status: 'error', error: 'Forbidden' },
    })).toBe('Job opening alerts are only available to job seekers.');
  });

  it('builds a return URL the login allowlist can keep', () => {
    expect(buildJobAlertsReturnUrl('Staff Nurse', 3)).toBe('/job-alerts?position=Staff%20Nurse&jobRoleId=3');
    expect(subscriptionsFromEnvelope({ status: 'success', data: { subscriptions: [] } })).toEqual([]);
  });

  it('remembers a jobs-browse return so seeker sign-in can reopen the subscribe modal', () => {
    expect(buildJobsBrowseAlertReturnUrl()).toBe('/jobs?openJobAlertModal=1');
    rememberJobAlertModalIntent();
    expect(sessionStorage.getItem(JOB_ALERT_MODAL_SESSION_KEY)).toBe('1');
    expect(localStorage.getItem('returnURL')).toBe('/jobs?openJobAlertModal=1');
    expect(jobAlertModalIntentPending()).toBe(true);
    clearJobAlertModalIntent();
    localStorage.removeItem('returnURL');
    expect(jobAlertModalIntentPending()).toBe(false);
  });
});
