import { consumeReturnUrl, rememberReturnUrl, safeReturnUrlForRole } from './auth-return-url.util';

describe('auth return URL', () => {
  afterEach(() => localStorage.removeItem('returnURL'));

  it('preserves a recruiter checkout URL for an employer sign-in', () => {
    const url = '/recruiter/subscription/upgrade/growth?billing=monthly';
    rememberReturnUrl(url, 2);
    expect(consumeReturnUrl(2)).toBe(url);
    expect(localStorage.getItem('returnURL')).toBeNull();
  });

  it('keeps a job-alerts manage URL, including the prefilled position', () => {
    const url = '/job-alerts?position=Staff%20Nurse&jobRoleId=3';
    rememberReturnUrl(url, 3);
    expect(consumeReturnUrl(3)).toBe(url);
  });

  it('rejects external, protocol-relative, and cross-role destinations', () => {
    expect(safeReturnUrlForRole('https://evil.example/recruiter', 2)).toBeNull();
    expect(safeReturnUrlForRole('//evil.example/recruiter', 2)).toBeNull();
    expect(safeReturnUrlForRole('/user/dashboard', 2)).toBeNull();
    expect(safeReturnUrlForRole('/recruiter/dashboard', 3)).toBeNull();
    expect(safeReturnUrlForRole('/job-alerts', 2)).toBeNull();
  });
});
