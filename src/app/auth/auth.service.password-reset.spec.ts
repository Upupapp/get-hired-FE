import { of } from 'rxjs';
import { AuthService } from './auth.service';

describe('AuthService password reset', () => {
  it('normalizes and URL-encodes the recovery email', () => {
    const baseService = { get: jasmine.createSpy('get').and.returnValue(of({})) } as any;
    const service = new AuthService(baseService);

    service.getEmailPwLink('  Paul+Hiring@LGUIDS.com.ph  ');

    expect(baseService.get).toHaveBeenCalledWith(
      `${service.authUrl}/getpwresetlink?email=paul%2Bhiring%40lguids.com.ph`
    );
  });
});
