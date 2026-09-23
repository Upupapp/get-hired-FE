export type AppAuthRole = 1 | 2 | 3;

export function safeReturnUrlForRole(value: string | null | undefined, role: AppAuthRole): string | null {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.indexOf('\\') !== -1) return null;
  try {
    const parsed = new URL(value, 'https://gethired.local');
    if (parsed.origin !== 'https://gethired.local') return null;
    const allowed = role === 2
      ? parsed.pathname === '/recruiter' || parsed.pathname.startsWith('/recruiter/')
      : role === 3
        ? parsed.pathname === '/user' || parsed.pathname.startsWith('/user/') || parsed.pathname.startsWith('/jobs/') || parsed.pathname === '/job-alerts'
        : parsed.pathname === '/admin' || parsed.pathname.startsWith('/admin/');
    return allowed ? `${parsed.pathname}${parsed.search}${parsed.hash}` : null;
  } catch (_) {
    return null;
  }
}

export function rememberReturnUrl(value: string, role: AppAuthRole): void {
  const safe = safeReturnUrlForRole(value, role);
  if (safe) localStorage.setItem('returnURL', safe);
}

export function consumeReturnUrl(role: AppAuthRole): string | null {
  const stored = localStorage.getItem('returnURL');
  localStorage.removeItem('returnURL');
  return safeReturnUrlForRole(stored, role);
}
