import { HttpContext, HttpErrorResponse, HttpHandler, HttpHeaders, HttpRequest, HttpResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { SKIP_SESSION_EXPIRY, UnAuthorizedInterceptor } from './unauthorize.interceptor';

describe('UnAuthorizedInterceptor stale shell recovery', () => {
  afterEach(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('state');
    localStorage.removeItem('returnURL');
  });

  it('refreshes and retries when a token exists even if the local state flag is stale', (done) => {
    localStorage.setItem('state', 'false');
    localStorage.setItem('token', 'Bearer stale-token');

    const router = { navigateByUrl: jasmine.createSpy('navigateByUrl') };
    const core = { isLoggedIn: () => false, suppressExpiryHandling: false, discardExpiredSession: jasmine.createSpy('discardExpiredSession') };
    const snackbar = { error: jasmine.createSpy('error'), warning: jasmine.createSpy('warning') };
    const lifecycle = {
      refreshNow: jasmine.createSpy('refreshNow').and.callFake(() => {
        localStorage.setItem('token', 'Bearer fresh-token');
        return of(true);
      }),
    };
    const interceptor = new UnAuthorizedInterceptor(router as any, core as any, snackbar as any, lifecycle as any);
    let calls = 0;
    const next: HttpHandler = {
      handle: (request) => {
        calls += 1;
        if (calls === 1) {
          return throwError(() => new HttpErrorResponse({ status: 401 }));
        }
        expect(request.headers.get('Authorization')).toBe('Bearer fresh-token');
        return of(new HttpResponse({ status: 200 }));
      },
    };

    interceptor.intercept(new HttpRequest('POST', '/checkout', {}), next).subscribe({
      next: () => {},
      error: done.fail,
      complete: () => {
        expect(lifecycle.refreshNow).toHaveBeenCalledTimes(1);
        expect(calls).toBe(2);
        expect(router.navigateByUrl).not.toHaveBeenCalled();
        done();
      },
    });
  });

  it('does not sign out for a 401 from an optional subscription enhancement', (done) => {
    localStorage.setItem('state', 'true');
    localStorage.setItem('token', 'Bearer valid-checkout-token');
    const router = { url: '/recruiter/subscription/upgrade/growth?billing=annual', navigate: jasmine.createSpy('navigate') };
    const core = { isLoggedIn: () => true, suppressExpiryHandling: false, discardExpiredSession: jasmine.createSpy('discardExpiredSession') };
    const snackbar = { error: jasmine.createSpy('error'), warning: jasmine.createSpy('warning') };
    const lifecycle = { refreshNow: jasmine.createSpy('refreshNow') };
    const interceptor = new UnAuthorizedInterceptor(router as any, core as any, snackbar as any, lifecycle as any);
    const next: HttpHandler = { handle: () => throwError(() => new HttpErrorResponse({ status: 401 })) };
    const request = new HttpRequest('POST', '/employer/subscription/upgrade-preview', {}, {
      context: new HttpContext().set(SKIP_SESSION_EXPIRY, true),
    });

    interceptor.intercept(request, next).subscribe({
      next: () => done.fail('expected the optional request to retain its 401'),
      error: (err) => {
        expect(err.status).toBe(401);
        expect(lifecycle.refreshNow).not.toHaveBeenCalled();
        expect(core.discardExpiredSession).not.toHaveBeenCalled();
        expect(router.navigate).not.toHaveBeenCalled();
        done();
      },
    });
  });

  it('clears a dead restored session on a protected route even when its token is gone', (done) => {
    localStorage.setItem('state', 'false');
    const router = { url: '/recruiter/subscription/upgrade/growth?billing=monthly', navigate: jasmine.createSpy('navigate') };
    const core = { isLoggedIn: () => false, suppressExpiryHandling: false, discardExpiredSession: jasmine.createSpy('discardExpiredSession') };
    const snackbar = { error: jasmine.createSpy('error'), warning: jasmine.createSpy('warning') };
    const lifecycle = { refreshNow: jasmine.createSpy('refreshNow').and.returnValue(of(false)) };
    const interceptor = new UnAuthorizedInterceptor(router as any, core as any, snackbar as any, lifecycle as any);
    const next: HttpHandler = { handle: () => throwError(() => new HttpErrorResponse({ status: 401 })) };

    interceptor.intercept(new HttpRequest('POST', '/checkout', {}), next).subscribe({
      next: () => done.fail('expected a 401'),
      error: () => {
        expect(lifecycle.refreshNow).toHaveBeenCalledTimes(1);
        expect(core.discardExpiredSession).toHaveBeenCalledTimes(1);
        expect(localStorage.getItem('returnURL')).toBe('/recruiter/subscription/upgrade/growth?billing=monthly');
        expect(router.navigate).toHaveBeenCalledWith(['/signin'], { queryParams: { role: 2 } });
        done();
      },
    });
  });

  it('recovers a status-shaped production 401 without requiring class identity', (done) => {
    const router = { url: '/recruiter/subscription', navigate: jasmine.createSpy('navigate') };
    const core = { isLoggedIn: () => false, suppressExpiryHandling: false, discardExpiredSession: jasmine.createSpy('discardExpiredSession') };
    const snackbar = { error: jasmine.createSpy('error'), warning: jasmine.createSpy('warning') };
    const lifecycle = { refreshNow: jasmine.createSpy('refreshNow').and.returnValue(of(false)) };
    const interceptor = new UnAuthorizedInterceptor(router as any, core as any, snackbar as any, lifecycle as any);
    const next: HttpHandler = { handle: () => throwError(() => ({ status: 401, error: 'Unauthorized' })) };

    interceptor.intercept(new HttpRequest('GET', '/subscription'), next).subscribe({
      next: () => done.fail('expected a 401'),
      error: () => {
        expect(core.discardExpiredSession).toHaveBeenCalledTimes(1);
        expect(router.navigate).toHaveBeenCalledWith(['/signin'], { queryParams: { role: 2 } });
        done();
      },
    });
  });

  it('does not expire a newer session when an older request returns 401 late', (done) => {
    localStorage.setItem('state', 'true');
    localStorage.setItem('token', 'Bearer new-session-token');
    const router = { url: '/recruiter/subscription', navigate: jasmine.createSpy('navigate') };
    const core = { isLoggedIn: () => true, suppressExpiryHandling: false, discardExpiredSession: jasmine.createSpy('discardExpiredSession') };
    const snackbar = { error: jasmine.createSpy('error'), warning: jasmine.createSpy('warning') };
    const lifecycle = { refreshNow: jasmine.createSpy('refreshNow') };
    const interceptor = new UnAuthorizedInterceptor(router as any, core as any, snackbar as any, lifecycle as any);
    let calls = 0;
    const next: HttpHandler = {
      handle: (request) => {
        calls += 1;
        if (calls === 1) return throwError(() => new HttpErrorResponse({ status: 401 }));
        expect(request.headers.get('Authorization')).toBe('Bearer new-session-token');
        return of(new HttpResponse({ status: 200 }));
      },
    };
    const staleRequest = new HttpRequest('GET', '/subscription', null, {
      headers: new HttpHeaders({ Authorization: 'Bearer old-session-token' }),
    });

    interceptor.intercept(staleRequest, next).subscribe({
      error: done.fail,
      complete: () => {
        expect(calls).toBe(2);
        expect(lifecycle.refreshNow).not.toHaveBeenCalled();
        expect(core.discardExpiredSession).not.toHaveBeenCalled();
        expect(router.navigate).not.toHaveBeenCalled();
        done();
      },
    });
  });

  it('clears the session when the request still returns 401 after refresh', (done) => {
    localStorage.setItem('state', 'true');
    localStorage.setItem('token', 'Bearer expired-token');
    const router = { url: '/recruiter/subscription', navigate: jasmine.createSpy('navigate') };
    const core = { isLoggedIn: () => true, suppressExpiryHandling: false, discardExpiredSession: jasmine.createSpy('discardExpiredSession') };
    const snackbar = { error: jasmine.createSpy('error'), warning: jasmine.createSpy('warning') };
    const lifecycle = {
      refreshNow: jasmine.createSpy('refreshNow').and.callFake(() => {
        localStorage.setItem('token', 'Bearer refreshed-but-rejected-token');
        return of(true);
      }),
    };
    const interceptor = new UnAuthorizedInterceptor(router as any, core as any, snackbar as any, lifecycle as any);
    const next: HttpHandler = {
      handle: () => throwError(() => new HttpErrorResponse({ status: 401 })),
    };

    interceptor.intercept(new HttpRequest('GET', '/subscription'), next).subscribe({
      next: () => done.fail('expected the retried 401'),
      error: () => {
        expect(lifecycle.refreshNow).toHaveBeenCalledTimes(1);
        expect(core.discardExpiredSession).toHaveBeenCalledTimes(1);
        expect(router.navigate).toHaveBeenCalledWith(['/signin'], { queryParams: { role: 2 } });
        done();
      },
    });
  });
});
