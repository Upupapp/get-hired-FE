import { AuthGuard } from './auth.guard';

describe('AuthGuard session consistency', () => {
  let router: any;
  let core: any;
  let guard: AuthGuard;

  beforeEach(() => {
    localStorage.clear();
    router = {
      navigate: jasmine.createSpy('navigate'),
      navigateByUrl: jasmine.createSpy('navigateByUrl'),
    };
    core = {
      getRole: jasmine.createSpy('getRole').and.returnValue(Promise.resolve('2')),
      discardExpiredSession: jasmine.createSpy('discardExpiredSession'),
    };
    guard = new AuthGuard(core, router, { open: jasmine.createSpy('open') } as any, {} as any);
  });

  afterEach(() => localStorage.clear());

  it('rejects and clears state=true when the session token is missing', async () => {
    localStorage.setItem('state', 'true');

    const allowed = await guard.checkUserLogin({ data: { role: '2' } } as any, '/recruiter/subscription');

    expect(allowed).toBe(false);
    expect(core.discardExpiredSession).toHaveBeenCalledTimes(1);
    expect(router.navigate).toHaveBeenCalledWith(['/signin'], { queryParams: { role: 2 } });
    expect(localStorage.getItem('returnURL')).toBe('/recruiter/subscription');
  });

  it('clears a leftover token when state=false', async () => {
    localStorage.setItem('state', 'false');
    localStorage.setItem('token', 'Bearer stale-token');

    expect(await guard.checkUserLogin({ data: { role: '3' } } as any, '/user/applications')).toBe(false);
    expect(core.discardExpiredSession).toHaveBeenCalledTimes(1);
    expect(router.navigate).toHaveBeenCalledWith(['/signin'], { queryParams: { role: 3 } });
  });

  it('allows a complete session with the correct role', async () => {
    localStorage.setItem('state', 'true');
    localStorage.setItem('token', 'Bearer current-token');

    expect(await guard.checkUserLogin({ data: { role: '2' } } as any, '/recruiter/dashboard')).toBe(true);
    expect(core.discardExpiredSession).not.toHaveBeenCalled();
  });
});
