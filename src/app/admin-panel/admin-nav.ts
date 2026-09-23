export type AdminNavIcon = 'dashboard' | 'users' | 'jobs' | 'companies' | 'applications' | 'finance' | 'tools';

export interface AdminNavItem {
  title: string;
  /** Path under /admin, used by routerLink. */
  route: string;
  icon: AdminNavIcon;
  /** Active-state match. Defaults to the full route. */
  match?: string;
  exact?: boolean;
}

export const ADMIN_NAV: AdminNavItem[] = [
  { title: 'Dashboard', route: 'dashboard', icon: 'dashboard', exact: true },
  { title: 'Users', route: 'users', icon: 'users' },
  { title: 'Jobs', route: 'jobs', icon: 'jobs' },
  { title: 'Companies', route: 'companies', icon: 'companies' },
  { title: 'Applications', route: 'applications', icon: 'applications' },
  { title: 'Finance', route: 'finance', icon: 'finance' },
  { title: 'Tools', route: 'tools/email-verify', icon: 'tools', match: 'tools' },
];
