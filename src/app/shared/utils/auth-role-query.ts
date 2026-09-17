export type AuthRole = 2 | 3;

/** Parse ?role=2|3 from a query string value. Anything else is no role. */
export function parseAuthRole(value: string | null | undefined): AuthRole | null {
  if (value === '2' || value === '3') {
    return Number(value) as AuthRole;
  }
  return null;
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
