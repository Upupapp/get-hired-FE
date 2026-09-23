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

  it('keeps the public jobs browse URL so a job-alert modal can resume after seeker sign-in', () => {
    const url = '/jobs?openJobAlertModal=1';
    rememberReturnUrl(url, 3);
    expect(consumeReturnUrl(3)).toBe(url);
  });

  it('does not send an employer to the jobs browse alert URL', () => {
    expect(safeReturnUrlForRole('/jobs?openJobAlertModal=1', 2)).toBeNull();
    expect(rememberReturnUrl('/jobs?openJobAlertModal=1', 2)).toBeUndefined();
    expect(localStorage.getItem('returnURL')).toBeNull();
  });

  it('rejects external, protocol-relative, and cross-role destinations', () => {
    expect(safeReturnUrlForRole('https://evil.example/recruiter', 2)).toBeNull();
    expect(safeReturnUrlForRole('//evil.example/recruiter', 2)).toBeNull();
    expect(safeReturnUrlForRole('/user/dashboard', 2)).toBeNull();
    expect(safeReturnUrlForRole('/recruiter/dashboard', 3)).toBeNull();
    expect(safeReturnUrlForRole('/job-alerts', 2)).toBeNull();
  });
});
