import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { environment } from '@environments/environment';

/**
 * First-party pageview beacon for the Admin Pageviews KPI.
 *
 * Additive to the existing gtag `page_view` in AppComponent. Fires once per
 * completed browser navigation (public, seeker, employer, and admin). Never
 * runs during SSR. Failures stay silent — no snackbar, no console noise.
 *
 * Session id lives in `gh_pv_session`. CoreService.logout() only removes
 * AUTH_SESSION_STORAGE_KEYS, so this key is left in place on purpose and
 * must not be added to that list.
 */
export const PAGEVIEW_SESSION_STORAGE_KEY = 'gh_pv_session';

/** Pathname cap agreed with the ingest plan (~512). */
export const PAGEVIEW_MAX_PATH_LENGTH = 512;

export interface SitePageviewBody {
  path: string;
  session_id: string;
  referrer: string | null;
  is_authenticated: boolean;
}

/** Pathname only: no origin, no query, no hash. Null when it cannot be sent. */
export function pathnameOnly(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') {
    return null;
  }
  let path = url.trim();
  if (!path) {
    return null;
  }
  if (/^[a-z][a-z0-9+.-]*:/i.test(path)) {
    try {
      path = new URL(path).pathname || '';
    } catch {
      return null;
    }
  } else {
    const queryAt = path.indexOf('?');
    if (queryAt >= 0) {
      path = path.slice(0, queryAt);
    }
    const hashAt = path.indexOf('#');
    if (hashAt >= 0) {
      path = path.slice(0, hashAt);
    }
  }
  if (!path.startsWith('/') || path.startsWith('//')) {
    return null;
  }
  if (path.length > PAGEVIEW_MAX_PATH_LENGTH) {
    path = path.slice(0, PAGEVIEW_MAX_PATH_LENGTH);
  }
  return path;
}

/** Host only (`example.com`). Empty or unparseable referrers become null. */
export function referrerHost(referrer: string | null | undefined): string | null {
  if (!referrer) {
    return null;
  }
  try {
    const host = new URL(referrer).hostname;
    return host || null;
  } catch {
    return null;
  }
}

function newSessionId(): string {
  // TypeScript 4.4's DOM lib has no randomUUID; browsers that ship it still do.
  const webCrypto = (typeof crypto !== 'undefined' ? crypto : undefined) as
    (Crypto & { randomUUID?: () => string }) | undefined;
  if (webCrypto && typeof webCrypto.randomUUID === 'function') {
    return webCrypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  if (webCrypto && typeof webCrypto.getRandomValues === 'function') {
    webCrypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

@Injectable({ providedIn: 'root' })
export class SitePageviewBeaconService {
  private listening = false;
  private memorySessionId: string | null = null;

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {}

  /**
   * One subscription for the whole SPA. Initial navigation in this app emits
   * NavigationEnd; if that event already happened before start() (blocking
   * initial navigation finishes before the root component), record the
   * current router URL once so the first paint is not dropped and not
   * counted twice.
   */
  start(): void {
    if (this.listening || !isPlatformBrowser(this.platformId)) {
      return;
    }
    this.listening = true;
    const alreadyNavigated = this.router.navigated === true;
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
    ).subscribe((event) => {
      this.recordNavigation(event.urlAfterRedirects);
    });
    if (alreadyNavigated) {
      this.recordNavigation(this.router.url);
    }
  }

  /** Sends one pageview for a completed navigation URL. Never throws. */
  recordNavigation(url: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    try {
      const path = pathnameOnly(url);
      if (!path) {
        return;
      }
      this.dispatch({
        path,
        session_id: this.sessionId(),
        referrer: referrerHost(this.readReferrer()),
        is_authenticated: this.isAuthenticated(),
      });
    } catch {
      // Analytics must never reach the UI.
    }
  }

  private readReferrer(): string {
    try {
      return typeof document !== 'undefined' ? document.referrer : '';
    } catch {
      return '';
    }
  }

  /**
   * Same snapshot CoreService.isLoggedIn() uses (`localStorage.state === 'true'`).
   * Boolean only — uid, email, and tokens are never read here.
   */
  private isAuthenticated(): boolean {
    try {
      return typeof localStorage !== 'undefined' && localStorage.getItem('state') === 'true';
    } catch {
      return false;
    }
  }

  private sessionId(): string {
    try {
      if (typeof localStorage === 'undefined') {
        return this.memorySession();
      }
      const existing = localStorage.getItem(PAGEVIEW_SESSION_STORAGE_KEY);
      if (existing && existing.trim()) {
        return existing;
      }
      const created = this.memorySession();
      localStorage.setItem(PAGEVIEW_SESSION_STORAGE_KEY, created);
      return created;
    } catch {
      return this.memorySession();
    }
  }

  private memorySession(): string {
    if (!this.memorySessionId) {
      this.memorySessionId = newSessionId();
    }
    return this.memorySessionId;
  }

  private dispatch(body: SitePageviewBody): void {
    const url = `${environment.api_url}/public/pageview`;
    let json: string;
    try {
      json = JSON.stringify(body);
    } catch {
      return;
    }
    try {
      const beacon = typeof navigator !== 'undefined' ? navigator.sendBeacon : undefined;
      if (typeof beacon === 'function') {
        const blob = new Blob([json], { type: 'application/json' });
        if (beacon.call(navigator, url, blob)) {
          return;
        }
      }
    } catch {
      // Queue failed; try fetch below.
    }
    try {
      if (typeof fetch !== 'function') {
        return;
      }
      fetch(url, {
        method: 'POST',
        body: json,
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
        credentials: 'omit',
      }).catch(() => undefined);
    } catch {
      // Network or runtime failure stays inside the beacon.
    }
  }
}
