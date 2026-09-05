import { Injectable, OnDestroy } from '@angular/core';
import { HttpBackend, HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, finalize, map, shareReplay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

/**
 * SESSION-SILENT-REFRESH: centralizes the FE half of the auth token
 * lifecycle -- decoding the current ID token's real expiry, proactively
 * refreshing it before that deadline via Firebase's own public Secure
 * Token REST endpoint, and de-duplicating concurrent refresh attempts
 * (one in-flight request shared by every caller that asks at the same
 * time, whether that's this service's own timer or UnAuthorizedInterceptor
 * reacting to a live 401).
 *
 * Root cause this replaces: the BE issues a real Firebase ID token (see
 * get-hired-BE/helpers/firebaseFunctions.js's signInUserAndGetTokeninFirebase)
 * with Firebase's fixed, non-configurable 1-hour lifetime, and also issues a
 * refreshToken -- but nothing in this app ever used it. Every session hard-
 * expired exactly 1 hour after login with zero warning, and the only
 * response was UnAuthorizedInterceptor's hard logout+toast+redirect on the
 * next failed request. The refresh token was sitting in localStorage doing
 * nothing.
 *
 * Why the Secure Token REST endpoint (not the Firebase Auth SDK): this app
 * never adopted the Firebase Client SDK for its own session -- sign-in is a
 * server-side REST call in get-hired-BE, which just hands the FE a raw ID
 * token + refresh token string pair. There is no `firebase`/`@angular/fire`
 * dependency and no initializeApp() anywhere in this codebase to attach an
 * SDK-managed session to. https://securetoken.googleapis.com/v1/token is
 * Firebase's own public, documented, client-safe REST endpoint for
 * exchanging a refresh token for a new ID token -- every Firebase Client
 * SDK uses this exact endpoint internally, so this is that same standard
 * protocol, not a custom one. It needs only the Firebase Web API key
 * already present in this app's own environment config
 * (environment.firebase.apiKey) -- a public-by-design client key, not a
 * secret; no BE change needed.
 *
 * Why HttpBackend instead of HttpClient: this call must never carry this
 * app's own (possibly stale/expired) Authorization header, and must never
 * be caught by UnAuthorizedInterceptor's own 401 handling if Google's
 * endpoint ever 400s on an invalid/expired refresh token -- HttpBackend
 * bypasses every registered HTTP_INTERCEPTORS entry, giving a clean,
 * unauthenticated request straight to Google's token endpoint.
 */
@Injectable({ providedIn: 'root' })
export class TokenLifecycleService implements OnDestroy {
  /** Refresh this long before the token's real exp claim, not "45 minutes
   *  after login" or any other login-time-relative guess -- always
   *  computed from the token's own decoded expiry. */
  private static readonly REFRESH_BUFFER_MS = 5 * 60 * 1000;
  /** Never schedule less than this out, even if the token is already
   *  within the buffer or technically expired when this runs -- avoids a
   *  tight synchronous refresh-reschedule-refresh loop if something about
   *  the decoded exp is degenerate (e.g. clock skew). */
  private static readonly MIN_DELAY_MS = 2000;

  private readonly rawHttp: HttpClient;
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;
  private refreshInFlight$: Observable<boolean> | null = null;
  private visibilityHandler = () => {
    if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
      // WAKE-OLD-TAB / RETURN-AFTER-INACTIVITY: re-derive from the token's
      // real exp every time the tab becomes visible again, rather than
      // trusting a timer that may have been throttled/paused by the
      // browser while the tab was backgrounded. If the token is already
      // past (or within) the buffer, this schedules an ~immediate refresh;
      // if the token is still comfortably valid, it just reschedules the
      // same real deadline.
      this.scheduleFromCurrentToken();
    }
  };

  constructor(httpBackend: HttpBackend) {
    this.rawHttp = new HttpClient(httpBackend);
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.visibilityHandler);
    }
  }

  ngOnDestroy(): void {
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
    }
    this.stop();
  }

  /**
   * APP-STARTUP / BROWSER-REFRESH / POST-SIGN-IN: call this once whenever
   * a session becomes current -- app bootstrap (if already logged in),
   * right after a fresh sign-in, and on tab-visibility wake (wired above).
   * Safe to call repeatedly; each call fully replaces any prior schedule.
   */
  scheduleFromCurrentToken(): void {
    this.clearTimer();
    if (typeof localStorage === 'undefined') return;

    const storedToken = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    // No refresh token available (never issued for this session, e.g. an
    // OAuth flow that didn't return one) -- nothing to schedule. Today's
    // reactive 401 handling remains the only safety net for this session,
    // unchanged.
    if (!storedToken || !refreshToken) return;

    const expMs = this.decodeJwtExpMs(storedToken.replace(/^Bearer\s+/i, ''));
    // Can't determine a real expiry (malformed/non-JWT token) -- don't
    // guess a fixed duration in UI code; leave the reactive path as-is.
    if (!expMs) return;

    const delay = Math.max(
      TokenLifecycleService.MIN_DELAY_MS,
      expMs - Date.now() - TokenLifecycleService.REFRESH_BUFFER_MS,
    );
    this.refreshTimer = setTimeout(() => this.refreshNow().subscribe(), delay);
  }

  /**
   * SINGLE-FLIGHT REFRESH: the actual refresh call. Every caller that asks
   * while one is already in flight (the proactive timer above, or
   * UnAuthorizedInterceptor reacting to a live 401 from several requests
   * that all discovered the expiry at once) shares this exact same
   * Observable/HTTP call via shareReplay(1) instead of firing a duplicate
   * request each -- no refresh storms.
   *
   * Never throws: a failed refresh (invalid/expired/revoked refresh
   * token, network failure) resolves to `false`, which is the caller's
   * signal to fall back to the existing hard-logout path -- this service
   * is never the thing that logs a user out; it only ever tries to avoid
   * that becoming necessary.
   */
  refreshNow(): Observable<boolean> {
    if (this.refreshInFlight$) return this.refreshInFlight$;

    const refreshToken = typeof localStorage !== 'undefined' ? localStorage.getItem('refreshToken') : null;
    if (!refreshToken) return of(false);

    const apiKey = (environment as any).firebase && (environment as any).firebase.apiKey;
    if (!apiKey) return of(false);

    const body = new URLSearchParams();
    body.set('grant_type', 'refresh_token');
    body.set('refresh_token', refreshToken);

    this.refreshInFlight$ = this.rawHttp.post<any>(
      `https://securetoken.googleapis.com/v1/token?key=${apiKey}`,
      body.toString(),
      { headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' }) },
    ).pipe(
      map((res) => {
        // Firebase's Secure Token response names the new ID token
        // `id_token` (and mirrors it as `access_token`); either is the
        // same value. `refresh_token` may come back rotated -- always
        // persist whatever it returns, falling back to the one just used
        // if the response is ever missing it.
        const newIdToken: string | undefined = res && (res.id_token || res.access_token);
        const newRefreshToken: string = (res && res.refresh_token) || refreshToken;
        if (!newIdToken) return false;

        // SAME KEYS, SAME FORMAT as every existing sign-in path (signin.
        // component.ts, google-auth.service.ts, linkedin-auth.service.ts)
        // -- AuthenticationInterceptor reads `token` verbatim (already
        // expects the "Bearer " prefix baked in), and `token_authorization`
        // is the plain-token duplicate those same call sites also write.
        localStorage.setItem('token', 'Bearer ' + newIdToken);
        localStorage.setItem('token_authorization', newIdToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        // Reschedule the NEXT proactive refresh from the token we just
        // received, not the one we started with.
        this.scheduleFromCurrentToken();
        return true;
      }),
      catchError(() => of(false)),
      finalize(() => { this.refreshInFlight$ = null; }),
      shareReplay(1),
    );

    return this.refreshInFlight$;
  }

  /** Called from CoreService.logout() -- no reason to keep a refresh timer
   *  alive (or let an in-flight refresh silently repopulate localStorage
   *  with a live session) once the user has actually signed out. */
  stop(): void {
    this.clearTimer();
    this.refreshInFlight$ = null;
  }

  private clearTimer(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /** Decodes (never verifies -- this is UI-scheduling only, not a security
   *  boundary; the BE independently verifies every token on every request
   *  regardless of what this returns) a JWT's `exp` claim into epoch ms.
   *  Returns null for anything that doesn't parse as a 3-part JWT with a
   *  numeric `exp`, rather than guessing. */
  private decodeJwtExpMs(rawToken: string): number | null {
    try {
      const parts = rawToken.split('.');
      if (parts.length !== 3) return null;
      let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4) { base64 += '='; }
      const json = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(json);
      return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
    } catch (_) {
      return null;
    }
  }
}
