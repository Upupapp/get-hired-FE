import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TokenLifecycleService } from './token-lifecycle.service';

describe('TokenLifecycleService session cleanup races', () => {
  let service: TokenLifecycleService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(TokenLifecycleService);
    http = TestBed.inject(HttpTestingController);
    localStorage.clear();
    localStorage.setItem('token', 'Bearer old-id-token');
    localStorage.setItem('refreshToken', 'old-refresh-token');
  });

  afterEach(() => {
    service.stop();
    http.verify();
    localStorage.clear();
  });

  it('does not restore a session when a refresh finishes after stop', () => {
    let result: boolean | undefined;
    service.refreshNow().subscribe(value => result = value);
    const request = http.expectOne(req => req.url.includes('securetoken.googleapis.com/v1/token'));

    service.stop();
    request.flush({ id_token: 'late-id-token', refresh_token: 'late-refresh-token' });

    expect(result).toBe(false);
    expect(localStorage.getItem('token')).toBe('Bearer old-id-token');
    expect(localStorage.getItem('refreshToken')).toBe('old-refresh-token');
  });

  it('does not let an older request clear the newer single-flight refresh', () => {
    const firstResult: boolean[] = [];
    service.refreshNow().subscribe(value => firstResult.push(value));
    const first = http.expectOne(req => req.url.includes('securetoken.googleapis.com/v1/token'));

    service.stop();
    service.refreshNow().subscribe();
    const second = http.expectOne(req => req.url.includes('securetoken.googleapis.com/v1/token'));
    first.flush({ id_token: 'late-token' });

    // The second subscriber still owns the in-flight slot, so another caller
    // must join it rather than issuing a third request.
    service.refreshNow().subscribe();
    http.expectNone(req => req.url.includes('securetoken.googleapis.com/v1/token'));
    second.flush({ id_token: 'current-token', refresh_token: 'current-refresh' });

    expect(firstResult).toEqual([false]);
    expect(localStorage.getItem('token')).toBe('Bearer current-token');
  });

  it('does not overwrite credentials established by a newer sign-in', () => {
    let result: boolean | undefined;
    service.refreshNow().subscribe(value => result = value);
    const request = http.expectOne(req => req.url.includes('securetoken.googleapis.com/v1/token'));

    localStorage.setItem('token', 'Bearer newly-signed-in-token');
    localStorage.setItem('refreshToken', 'newly-signed-in-refresh-token');
    request.flush({ id_token: 'late-old-token', refresh_token: 'late-old-refresh-token' });

    expect(result).toBe(false);
    expect(localStorage.getItem('token')).toBe('Bearer newly-signed-in-token');
    expect(localStorage.getItem('refreshToken')).toBe('newly-signed-in-refresh-token');
  });
});
