import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { EMPTY } from 'rxjs';
import { environment } from 'environments/environment';
import { MESSAGE_ACTION_ERROR, MESSAGE_ACTION_RESPONSE } from '../../../../../testing/engagement-contract.fixture';
import { E2_JOBS_80_OWNER, E2_STORAGE_90_OWNER, E2_STORAGE_FULL_OWNER } from '../../../../../testing/engagement-e2-code.fixture';
import { Nudge } from '@main/shared/engagement/engagement-contract.models';
import { UpgradePromptCardComponent } from './upgrade-prompt-card.component';

const URL = `${environment.api_url}/subscriptions/notifications`;

/** F2: the card renders a backend message as given, and its actions and dismiss follow the contract. */
describe('UpgradePromptCardComponent -- a backend message (F2)', () => {
  let fixture: ComponentFixture<UpgradePromptCardComponent>;
  let http: HttpTestingController;
  let navigateByUrl: jasmine.Spy;

  function render(message: Nudge): void {
    navigateByUrl = jasmine.createSpy('navigateByUrl');
    TestBed.configureTestingModule({
      declarations: [UpgradePromptCardComponent],
      imports: [HttpClientTestingModule],
      providers: [{ provide: Router, useValue: { navigateByUrl, navigate: jasmine.createSpy('navigate'), events: EMPTY, url: '/recruiter/dashboard', navigated: true } }],
    });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(UpgradePromptCardComponent);
    fixture.componentInstance.message = JSON.parse(JSON.stringify(message));
    fixture.detectChanges();
  }

  const card = (): HTMLElement | null => fixture.nativeElement.querySelector('.upgrade-prompt');
  const buttons = (): HTMLButtonElement[] => Array.from(fixture.nativeElement.querySelectorAll('button'));
  const button = (label: string): HTMLButtonElement => buttons().find(b => (b.textContent || '').trim() === label)!;

  afterEach(() => {
    http.match(r => r.url.endsWith('/subscriptions/upgrade-analytics')).forEach(r => r.flush({ success: true }));
    http.verify();
  });

  it('a HIGH message (storage.90) is announced as an alert, labelled, and offers its actions and a dismiss', () => {
    render(E2_STORAGE_90_OWNER);
    expect(card()!.getAttribute('data-priority')).toBe('HIGH');
    expect(card()!.classList).toContain('upgrade-prompt--high');
    expect(card()!.querySelector('.upgrade-prompt__text')!.getAttribute('role')).toBe('alert');
    expect(card()!.querySelector('.upgrade-prompt__priority')!.textContent!.trim()).toBe('Important');
    expect(buttons().map(b => b.textContent!.trim())).toEqual(['Compare plans', 'View Premium', 'Dismiss']);
  });

  it('a CRITICAL message offers no dismiss; an INFO message (jobs.80) is not an alert', () => {
    render(E2_STORAGE_FULL_OWNER);
    expect(fixture.nativeElement.querySelector('.upgrade-prompt__dismiss')).toBeNull();
    TestBed.resetTestingModule();
    render(E2_JOBS_80_OWNER);
    expect(card()!.querySelector('.upgrade-prompt__text')!.getAttribute('role')).toBeNull();
    expect(card()!.querySelector('.upgrade-prompt__priority')!.textContent!.trim()).toBe('For your information');
  });

  it('an action posts the click with its intent first, and navigates to its url only after the answer', () => {
    render(E2_STORAGE_90_OWNER);
    button('View Premium').click();
    expect(navigateByUrl).not.toHaveBeenCalled();
    const req = http.expectOne(`${URL}/nudge%3Astorage.90/click`);
    expect(req.request.body).toEqual({ intent: 'VIEW_PLAN' });
    expect(navigateByUrl).not.toHaveBeenCalled();
    req.flush({ success: true, found: true, status: 'CLICKED' });
    expect(navigateByUrl.calls.allArgs()).toEqual([['/recruiter/subscription/upgrade/business']]);
  });

  it('400 INVALID_INTENT leaves the message in place and navigates nowhere', () => {
    render(E2_STORAGE_90_OWNER);
    button('Compare plans').click();
    http.expectOne(`${URL}/nudge%3Astorage.90/click`)
      .flush({ success: false, code: 'INVALID_INTENT', message: 'That action is not offered.' }, { status: 400, statusText: 'Bad Request' });
    fixture.detectChanges();
    expect(navigateByUrl).not.toHaveBeenCalled();
    expect(card()).not.toBeNull();
  });

  it('409 NOT_DISMISSIBLE leaves the message in place and navigates nowhere; a dismiss that applies hides it and says so', () => {
    render(E2_STORAGE_90_OWNER);
    const dismissed = jasmine.createSpy('dismissed');
    fixture.componentInstance.dismissed.subscribe(dismissed);
    button('Dismiss').click();
    http.expectOne(`${URL}/nudge%3Astorage.90/dismiss`).flush(MESSAGE_ACTION_ERROR, { status: 409, statusText: 'Conflict' });
    fixture.detectChanges();
    expect(card()).not.toBeNull();
    expect(navigateByUrl).not.toHaveBeenCalled();
    expect(dismissed).not.toHaveBeenCalled();

    button('Dismiss').click();
    http.expectOne(`${URL}/nudge%3Astorage.90/dismiss`).flush(MESSAGE_ACTION_RESPONSE);
    fixture.detectChanges();
    expect(card()).toBeNull();
    expect(dismissed).toHaveBeenCalledTimes(1);
  });
});
