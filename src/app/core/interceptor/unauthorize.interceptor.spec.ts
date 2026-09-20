import { HttpErrorResponse, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { UnAuthorizedInterceptor } from './unauthorize.interceptor';

describe('UnAuthorizedInterceptor stale shell recovery', () => {
  afterEach(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('state');
  });

  it('refreshes and retries when a token exists even if the local state flag is stale', (done) => {
    localStorage.setItem('state', 'false');
    localStorage.setItem('token', 'Bearer stale-token');

    const router = { navigateByUrl: jasmine.createSpy('navigateByUrl') };
    const core = { isLoggedIn: () => false, suppressExpiryHandling: false, logout: jasmine.createSpy('logout') };
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

  it('clears a dead restored session on a protected route even when its token is gone', (done) => {
    localStorage.setItem('state', 'false');
    const router = { url: '/recruiter/subscription/upgrade/growth', navigateByUrl: jasmine.createSpy('navigateByUrl') };
    const core = { isLoggedIn: () => false, suppressExpiryHandling: false, logout: jasmine.createSpy('logout') };
    const snackbar = { error: jasmine.createSpy('error'), warning: jasmine.createSpy('warning') };
    const lifecycle = { refreshNow: jasmine.createSpy('refreshNow').and.returnValue(of(false)) };
    const interceptor = new UnAuthorizedInterceptor(router as any, core as any, snackbar as any, lifecycle as any);
    const next: HttpHandler = { handle: () => throwError(() => new HttpErrorResponse({ status: 401 })) };

    interceptor.intercept(new HttpRequest('POST', '/checkout', {}), next).subscribe({
      next: () => done.fail('expected a 401'),
      error: () => {
        expect(lifecycle.refreshNow).toHaveBeenCalledTimes(1);
        expect(core.logout).toHaveBeenCalledTimes(1);
        expect(router.navigateByUrl).toHaveBeenCalledWith('/signin');
        done();
      },
    });
  });

  it('recovers a status-shaped production 401 without requiring class identity', (done) => {
    const router = { url: '/recruiter/subscription', navigateByUrl: jasmine.createSpy('navigateByUrl') };
    const core = { isLoggedIn: () => false, suppressExpiryHandling: false, logout: jasmine.createSpy('logout') };
    const snackbar = { error: jasmine.createSpy('error'), warning: jasmine.createSpy('warning') };
    const lifecycle = { refreshNow: jasmine.createSpy('refreshNow').and.returnValue(of(false)) };
    const interceptor = new UnAuthorizedInterceptor(router as any, core as any, snackbar as any, lifecycle as any);
    const next: HttpHandler = { handle: () => throwError(() => ({ status: 401, error: 'Unauthorized' })) };

    interceptor.intercept(new HttpRequest('GET', '/subscription'), next).subscribe({
      next: () => done.fail('expected a 401'),
      error: () => {
        expect(core.logout).toHaveBeenCalledTimes(1);
        expect(router.navigateByUrl).toHaveBeenCalledWith('/signin');
        done();
      },
    });
  });
});
