export type AuthRole = 2 | 3;

/** Public auth tab order: Employers, then Job seekers. Labels are product copy. */
export const AUTH_ROLE_TABS: ReadonlyArray<{ role: AuthRole; label: string }> = [
  { role: 2, label: 'Employers' },
  { role: 3, label: 'Job seekers' },
];

/**
 * Parse public auth role from ?role=.
 * Numeric 2|3 is the canonical contract. Aliases employer|seeker map to the same roles.
 * Anything else (including admin / role 1) is no role.
 */
export function parseAuthRole(value: string | null | undefined): AuthRole | null {
  if (value == null) {
    return null;
  }
  const normalized = String(value).trim().toLowerCase();
  if (normalized === '2' || normalized === 'employer') {
    return 2;
  }
  if (normalized === '3' || normalized === 'seeker') {
    return 3;
  }
  return null;
}

/** True only for the numeric query contract (?role=2 or ?role=3). */
export function isCanonicalAuthRoleParam(value: string | null | undefined): boolean {
  return value === '2' || value === '3';
}

/**
 * Public-page role context for header / marketing CTAs.
 * /employers* → Employer (2). Other public surfaces → Job Seeker (3).
 */
export function roleFromPublicUrl(url: string | null | undefined): AuthRole {
  const path = (url || '').split('?')[0];
  if (path.startsWith('/employers')) {
    return 2;
  }
  return 3;
}

export function authRoleQuery(role: AuthRole | null | undefined): { role: AuthRole } | Record<string, never> {
  return role === 2 || role === 3 ? { role } : {};
}

export function authRoleLabel(role: AuthRole): string {
  return role === 2 ? 'Employer' : 'Job Seeker';
}

export function otherAuthRole(role: AuthRole): AuthRole {
  return role === 2 ? 3 : 2;
}
