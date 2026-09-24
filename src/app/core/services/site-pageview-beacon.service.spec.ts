import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { environment } from '@environments/environment';
import { AUTH_SESSION_STORAGE_KEYS } from './core.service';
import {
  PAGEVIEW_MAX_PATH_LENGTH,
  PAGEVIEW_SESSION_STORAGE_KEY,
  SitePageviewBeaconService,
  pathnameOnly,
  referrerHost,
} from './site-pageview-beacon.service';

class RouterStub {
  events = new Subject<unknown>();
  navigated = false;
  url = '/';
}

describe('SitePageviewBeaconService', () => {
  let service: SitePageviewBeaconService;
  let router: RouterStub;
  let sendBeacon: jasmine.Spy;

  function payloadOf(callIndex = 0): any {
    const blob = sendBeacon.calls.argsFor(callIndex)[1] as Blob;
    return blob.text().then((text) => JSON.parse(text));
  }

  beforeEach(() => {
    localStorage.removeItem(PAGEVIEW_SESSION_STORAGE_KEY);
    localStorage.removeItem('state');
    router = new RouterStub();
    sendBeacon = spyOn(navigator, 'sendBeacon').and.returnValue(true);

    TestBed.configureTestingModule({
      providers: [
        SitePageviewBeaconService,
        { provide: Router, useValue: router },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
    service = TestBed.inject(SitePageviewBeaconService);
  });

  afterEach(() => {
    localStorage.removeItem(PAGEVIEW_SESSION_STORAGE_KEY);
    localStorage.removeItem('state');
  });

  it('strips the query string and hash down to a pathname', async () => {
    service.recordNavigation('/jobs/details/JB-1?utm=1&ref=mail#apply');
    expect(sendBeacon).toHaveBeenCalledTimes(1);
    const body = await payloadOf();
    expect(body.path).toBe('/jobs/details/JB-1');
    expect(sendBeacon.calls.mostRecent().args[0]).toBe(`${environment.api_url}/public/pageview`);
  });

  it('drops the origin from an absolute URL and rejects non-paths', () => {
    expect(pathnameOnly('https://gethiredonline.app/jobs/foo?x=1')).toBe('/jobs/foo');
    expect(pathnameOnly('jobs/foo')).toBeNull();
    expect(pathnameOnly('//evil.example/jobs')).toBeNull();
    expect(pathnameOnly('')).toBeNull();

    service.recordNavigation('not-a-path');
    service.recordNavigation('//evil.example/jobs');
    expect(sendBeacon).not.toHaveBeenCalled();
  });

  it('caps the pathname at 512 characters', async () => {
    const longPath = '/' + 'a'.repeat(PAGEVIEW_MAX_PATH_LENGTH + 40);
    service.recordNavigation(longPath + '?q=1');
    const body = await payloadOf();
    expect(body.path.length).toBe(PAGEVIEW_MAX_PATH_LENGTH);
    expect(body.path.startsWith('/')).toBe(true);
    expect(body.path.includes('?')).toBe(false);
  });

  it('keeps one session id in localStorage across hits', async () => {
    service.recordNavigation('/home');
    service.recordNavigation('/jobs');
    const first = await payloadOf(0);
    const second = await payloadOf(1);
    expect(first.session_id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(second.session_id).toBe(first.session_id);
    expect(localStorage.getItem(PAGEVIEW_SESSION_STORAGE_KEY)).toBe(first.session_id);
  });

  it('reuses an existing session id and is not part of the logout wipe list', async () => {
    localStorage.setItem(PAGEVIEW_SESSION_STORAGE_KEY, '11111111-1111-4111-8111-111111111111');
    service.recordNavigation('/recruiter/dashboard');
    const body = await payloadOf();
    expect(body.session_id).toBe('11111111-1111-4111-8111-111111111111');
    expect(AUTH_SESSION_STORAGE_KEYS).not.toContain(PAGEVIEW_SESSION_STORAGE_KEY);
  });

  it('sends is_authenticated from the localStorage state snapshot only', async () => {
    service.recordNavigation('/jobs');
    expect((await payloadOf(0)).is_authenticated).toBe(false);

    localStorage.setItem('state', 'false');
    service.recordNavigation('/jobs');
    expect((await payloadOf(1)).is_authenticated).toBe(false);

    localStorage.setItem('state', 'true');
    localStorage.setItem('user', JSON.stringify({ email: 'person@example.com', _id: 'uid-1' }));
    localStorage.setItem('token', 'Bearer secret');
    service.recordNavigation('/admin');
    const authed = await payloadOf(2);
    expect(authed.is_authenticated).toBe(true);
    expect(Object.keys(authed).sort()).toEqual([
      'is_authenticated',
      'path',
      'referrer',
      'session_id',
    ]);
    expect(JSON.stringify(authed)).not.toContain('person@example.com');
    expect(JSON.stringify(authed)).not.toContain('uid-1');
    expect(JSON.stringify(authed)).not.toContain('Bearer');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  });

  it('sends a host-only referrer and null when it is empty', async () => {
    expect(referrerHost('https://example.com/path?q=1')).toBe('example.com');
    expect(referrerHost('')).toBeNull();
    expect(referrerHost('not a url')).toBeNull();

    const descriptor = Object.getOwnPropertyDescriptor(Document.prototype, 'referrer')
      || Object.getOwnPropertyDescriptor(document, 'referrer');
    Object.defineProperty(document, 'referrer', {
      configurable: true,
      get: () => 'https://news.example.com/story?id=9',
    });
    try {
      service.recordNavigation('/home');
      expect((await payloadOf()).referrer).toBe('news.example.com');
    } finally {
      if (descriptor) {
        Object.defineProperty(document, 'referrer', descriptor);
      }
    }
  });

  it('fires once per NavigationEnd and backfills when the first navigation already finished', async () => {
    service.start();
    router.events.next(new NavigationEnd(1, '/jobs?q=1', '/jobs?q=1'));
    router.events.next(new NavigationEnd(2, '/recruiter', '/recruiter'));
    expect(sendBeacon).toHaveBeenCalledTimes(2);
    expect((await payloadOf(0)).path).toBe('/jobs');
    expect((await payloadOf(1)).path).toBe('/recruiter');

    sendBeacon.calls.reset();
    service.start();
    router.events.next(new NavigationEnd(3, '/admin', '/admin'));
    expect(sendBeacon).toHaveBeenCalledTimes(1);
  });

  it('records the current URL once when NavigationEnd already happened', async () => {
    router.navigated = true;
    router.url = '/user/profile?tab=cv';
    service.start();
    expect(sendBeacon).toHaveBeenCalledTimes(1);
    expect((await payloadOf()).path).toBe('/user/profile');

    router.events.next(new NavigationEnd(4, '/home', '/home'));
    expect(sendBeacon).toHaveBeenCalledTimes(2);
  });

  it('swallows beacon and fetch failures without console.error', async () => {
    const errorSpy = spyOn(console, 'error');
    sendBeacon.and.throwError('beacon blocked');
    const fetchSpy = spyOn(window, 'fetch').and.returnValue(Promise.reject(new Error('offline')));

    expect(() => service.recordNavigation('/jobs')).not.toThrow();
    await Promise.resolve();

    expect(fetchSpy).toHaveBeenCalled();
    const init = fetchSpy.calls.mostRecent().args[1] as RequestInit;
    expect(init.method).toBe('POST');
    expect(init.keepalive).toBeTrue();
    expect(init.credentials).toBe('omit');
    expect(init.headers).toEqual({ 'Content-Type': 'application/json' });
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('uses fetch when sendBeacon cannot queue the hit', () => {
    sendBeacon.and.returnValue(false);
    const fetchSpy = spyOn(window, 'fetch').and.resolveTo(new Response(null, { status: 204 }));
    service.recordNavigation('/home');
    expect(fetchSpy).toHaveBeenCalled();
    expect(fetchSpy.calls.mostRecent().args[0]).toBe(`${environment.api_url}/public/pageview`);
  });
});

describe('SitePageviewBeaconService server platform', () => {
  let sendBeacon: jasmine.Spy;

  beforeEach(() => {
    sendBeacon = spyOn(navigator, 'sendBeacon').and.returnValue(true);
  });

  it('does not send from SSR', () => {
    const router = new RouterStub();
    router.navigated = true;
    router.url = '/jobs';
    TestBed.configureTestingModule({
      providers: [
        SitePageviewBeaconService,
        { provide: Router, useValue: router },
        { provide: PLATFORM_ID, useValue: 'server' },
      ],
    });
    const service = TestBed.inject(SitePageviewBeaconService);
    service.start();
    router.events.next(new NavigationEnd(1, '/jobs', '/jobs'));
    service.recordNavigation('/jobs');
    expect(sendBeacon).not.toHaveBeenCalled();
  });
});
