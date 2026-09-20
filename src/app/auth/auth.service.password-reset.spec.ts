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

  it('normalizes email credentials for every email/password sign-in', () => {
    const baseService = { post: jasmine.createSpy('post').and.returnValue(of({})) } as any;
    const service = new AuthService(baseService);

    service.signIn({ email: '  Paul@LGUIDS.com.ph  ', password: 'unchanged-password' });

    expect(baseService.post).toHaveBeenCalledWith(
      `${service.authUrl}/signin`,
      { email: 'paul@lguids.com.ph', password: 'unchanged-password' }
    );
  });

  it('normalizes the email without dropping sign-up fields', () => {
    const baseService = { post: jasmine.createSpy('post').and.returnValue(of({})) } as any;
    const service = new AuthService(baseService);
    const credentials = {
      email: ' New.User@Example.COM ',
      password: 'Strong1!',
      firstName: 'New',
      lastName: 'User',
      role: 3,
      recaptchaToken: 'captcha-token'
    } as any;

    service.signUp(credentials);

    expect(baseService.post).toHaveBeenCalledWith(
      `${service.authUrl}/signup`,
      { ...credentials, email: 'new.user@example.com' }
    );
  });

  it('normalizes and URL-encodes verification lookup emails', () => {
    const baseService = {
      get: jasmine.createSpy('get').and.returnValue(of({})),
      post: jasmine.createSpy('post').and.returnValue(of({}))
    } as any;
    const service = new AuthService(baseService);

    service.checkEmailIfExist(' Paul+Hiring@Example.COM ');
    service.resendVerification(' Paul+Hiring@Example.COM ');

    expect(baseService.get).toHaveBeenCalledWith(
      `${service.authUrl}/checkemailifexist?email=paul%2Bhiring%40example.com`
    );
    expect(baseService.post).toHaveBeenCalledWith(
      `${service.authUrl}/resendverificationlink?email=paul%2Bhiring%40example.com`
    );
  });
});
