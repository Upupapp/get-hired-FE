import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { EMPTY } from 'rxjs';
import { environment } from 'environments/environment';
import { MESSAGE_ACTION_ERROR, MESSAGE_ACTION_RESPONSE, NUDGE } from '../../../../../testing/engagement-contract.fixture';
import { E2_STORAGE_FULL_OWNER, E2_STORAGE_FULL_TEAM_ADMIN } from '../../../../../testing/engagement-e2-code.fixture';
import { Nudge } from '@main/shared/engagement/engagement-contract.models';
import { SubscriptionStatusBannerComponent } from './subscription-status-banner.component';

const URL = `${environment.api_url}/subscriptions/notifications`;

/** F2: the status banner renders a backend message as given, and its actions and dismiss follow the contract. */
describe('SubscriptionStatusBannerComponent -- a backend message (F2)', () => {
  let fixture: ComponentFixture<SubscriptionStatusBannerComponent>;
  let http: HttpTestingController;
  let navigateByUrl: jasmine.Spy;

  function render(message: Nudge | null, planStatus = ''): void {
    navigateByUrl = jasmine.createSpy('navigateByUrl');
    TestBed.configureTestingModule({
      declarations: [SubscriptionStatusBannerComponent],
      imports: [HttpClientTestingModule],
      providers: [{ provide: Router, useValue: { navigateByUrl, navigate: jasmine.createSpy('navigate'), events: EMPTY, url: '/recruiter/dashboard', navigated: true } }],
    });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(SubscriptionStatusBannerComponent);
    fixture.componentInstance.message = message ? JSON.parse(JSON.stringify(message)) : null;
    fixture.componentInstance.planStatus = planStatus;
    fixture.detectChanges();
  }

  const banner = (): HTMLElement | null => fixture.nativeElement.querySelector('.sub-banner');
  const buttons = (): HTMLButtonElement[] => Array.from(fixture.nativeElement.querySelectorAll('button'));
  const button = (label: string): HTMLButtonElement => buttons().find(b => (b.textContent || '').trim() === label)!;

  afterEach(() => {
    http.match(r => r.url.endsWith('/subscriptions/upgrade-analytics')).forEach(r => r.flush({ success: true }));
    http.verify();
  });

  it('storage.full renders as a CRITICAL alert with no dismiss control, for the owner and, redacted, for a team admin', () => {
    render(E2_STORAGE_FULL_OWNER);
    expect(banner()!.getAttribute('role')).toBe('alert');
    expect(banner()!.getAttribute('data-priority')).toBe('CRITICAL');
    expect(banner()!.querySelector('.sub-banner__priority')!.textContent!.trim()).toBe('Critical');
    expect(banner()!.querySelector('.sub-banner__title')!.textContent!.trim()).toBe('Your Recruitment Storage is full');
    expect(fixture.nativeElement.querySelector('.sub-banner__dismiss')).toBeNull();
    expect(buttons().map(b => b.textContent!.trim())).toEqual(['Compare plans', 'View Growth']);

    TestBed.resetTestingModule();
    render(E2_STORAGE_FULL_TEAM_ADMIN);
    expect(banner()!.getAttribute('role')).toBe('alert');
    expect(fixture.nativeElement.querySelector('.sub-banner__dismiss')).toBeNull();
    expect(buttons()).toEqual([]);
    expect(banner()!.querySelector('.sub-banner__body')!.textContent).toContain('Your account owner can review storage options.');
  });

  it('an action posts the click with its intent first, and navigates to its url only after the answer', () => {
    render(E2_STORAGE_FULL_OWNER);
    button('Compare plans').click();
    expect(navigateByUrl).not.toHaveBeenCalled();
    const req = http.expectOne(`${URL}/nudge%3Astorage.full/click`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ intent: 'COMPARE_PLANS' });
    expect(navigateByUrl).not.toHaveBeenCalled();
    req.flush({ success: true, found: true, status: 'CLICKED' });
    expect(navigateByUrl.calls.allArgs()).toEqual([['/recruiter/subscription']]);
  });

  it('400 INVALID_INTENT leaves the message in place and navigates nowhere', () => {
    render(E2_STORAGE_FULL_OWNER);
    button('View Growth').click();
    http.expectOne(`${URL}/nudge%3Astorage.full/click`)
      .flush({ success: false, code: 'INVALID_INTENT', message: 'That action is not offered.' }, { status: 400, statusText: 'Bad Request' });
    fixture.detectChanges();
    expect(navigateByUrl).not.toHaveBeenCalled();
    expect(banner()).not.toBeNull();
    expect(button('View Growth').disabled).toBeFalse();
  });

  it('409 NOT_DISMISSIBLE leaves the message in place and navigates nowhere; a dismiss that applies hides it', () => {
    render(NUDGE);
    expect(banner()!.getAttribute('role')).toBe('status');
    button('Dismiss').click();
    http.expectOne(`${URL}/nudge%3Astorage.80/dismiss`).flush(MESSAGE_ACTION_ERROR, { status: 409, statusText: 'Conflict' });
    fixture.detectChanges();
    expect(banner()).not.toBeNull();
    expect(navigateByUrl).not.toHaveBeenCalled();

    button('Dismiss').click();
    http.expectOne(`${URL}/nudge%3Astorage.80/dismiss`).flush(MESSAGE_ACTION_RESPONSE);
    fixture.detectChanges();
    expect(banner()).toBeNull();
  });

  it('a click that cannot be recorded (503) still takes the viewer to the url', () => {
    render(E2_STORAGE_FULL_OWNER);
    button('View Growth').click();
    http.expectOne(`${URL}/nudge%3Astorage.full/click`)
      .flush({ success: false, code: 'NOTIFICATIONS_UNAVAILABLE', message: 'Unavailable.' }, { status: 503, statusText: 'Service Unavailable' });
    expect(navigateByUrl.calls.allArgs()).toEqual([['/recruiter/subscription/upgrade/growth']]);
  });

  it('without a message, the planStatus banner renders as before', () => {
    render(null, 'trial_expired');
    expect(banner()!.classList).toContain('sub-banner--danger');
    expect(banner()!.querySelector('.sub-banner__title')!.textContent!.trim()).toBe('Your free trial has ended');
    expect(fixture.nativeElement.querySelector('.sub-banner__priority')).toBeNull();
  });
});
