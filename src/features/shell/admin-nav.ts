import type { AdminRole } from './admin-api';

export interface NavItem {
  href: string;
  label: string;
  /** Who sees it; "admin" always does. */
  roles: AdminRole[];
}

export const ADMIN_NAV: NavItem[] = [
  { href: '/', label: 'Dashboard', roles: ['support', 'finance'] },
  { href: '/support', label: 'Support', roles: ['support'] },
  { href: '/suche', label: 'Suche', roles: ['support'] },
  { href: '/laeden', label: 'Läden', roles: ['support', 'finance'] },
  { href: '/firmen', label: 'Firmen', roles: ['support', 'finance'] },
  { href: '/protokoll', label: 'Protokoll', roles: [] },
  { href: '/admins', label: 'Admins', roles: [] },
];

export function navFor(role: AdminRole): NavItem[] {
  return ADMIN_NAV.filter((item) => role === 'admin' || item.roles.includes(role));
}

export const ROLE_LABELS: Record<AdminRole, string> = { admin: 'Admin', support: 'Support', finance: 'Finanzen' };
