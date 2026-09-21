import { of, throwError } from 'rxjs';
import { UnauthGuard } from './unauth.guard';

describe('UnauthGuard expired-session recovery', () => {
  let router: any;
  let core: any;
  let guard: UnauthGuard;

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('state', 'true');
    router = { navigateByUrl: jasmine.createSpy('navigateByUrl') };
    core = {
      getRole: jasmine.createSpy('getRole').and.returnValue(Promise.resolve('2')),
      verifySession: jasmine.createSpy('verifySession'),
      discardExpiredSession: jasmine.createSpy('discardExpiredSession'),
      logout: jasmine.createSpy('logout'),
    };
    guard = new UnauthGuard(router, core, {} as any);
  });

  afterEach(() => localStorage.clear());

  it('clears an invalid session locally without revoking it', async () => {
    core.verifySession.and.returnValue(throwError(() => new Error('401')));

    expect(await guard.checkUserLogin()).toBe(true);
    expect(core.discardExpiredSession).toHaveBeenCalledTimes(1);
    expect(core.logout).not.toHaveBeenCalled();
  });

  it('uses local cleanup during the invalid-session cooldown too', async () => {
    core.verifySession.and.returnValue(throwError(() => new Error('401')));
    await guard.checkUserLogin();
    await guard.checkUserLogin();

    expect(core.verifySession).toHaveBeenCalledTimes(1);
    expect(core.discardExpiredSession).toHaveBeenCalledTimes(2);
    expect(core.logout).not.toHaveBeenCalled();
  });

  it('keeps a server-verified session and redirects by role', async () => {
    core.verifySession.and.returnValue(of({}));

    expect(await guard.checkUserLogin()).toBe(false);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/recruiter');
    expect(core.discardExpiredSession).not.toHaveBeenCalled();
  });
});
