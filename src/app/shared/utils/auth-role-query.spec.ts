import { isCanonicalAuthRoleParam, parseAuthRole } from './auth-role-query';

describe('parseAuthRole', () => {
  it('accepts numeric roles and employer/seeker aliases', () => {
    expect(parseAuthRole('2')).toBe(2);
    expect(parseAuthRole('3')).toBe(3);
    expect(parseAuthRole('employer')).toBe(2);
    expect(parseAuthRole('SEEKER')).toBe(3);
    expect(parseAuthRole(' Employer ')).toBe(2);
  });

  it('rejects admin and unknown values', () => {
    expect(parseAuthRole(null)).toBeNull();
    expect(parseAuthRole(undefined)).toBeNull();
    expect(parseAuthRole('')).toBeNull();
    expect(parseAuthRole('1')).toBeNull();
    expect(parseAuthRole('admin')).toBeNull();
    expect(parseAuthRole('jobseeker')).toBeNull();
  });

  it('treats only numeric 2 and 3 as canonical', () => {
    expect(isCanonicalAuthRoleParam('2')).toBeTrue();
    expect(isCanonicalAuthRoleParam('3')).toBeTrue();
    expect(isCanonicalAuthRoleParam('employer')).toBeFalse();
    expect(isCanonicalAuthRoleParam('seeker')).toBeFalse();
    expect(isCanonicalAuthRoleParam(null)).toBeFalse();
  });
});
