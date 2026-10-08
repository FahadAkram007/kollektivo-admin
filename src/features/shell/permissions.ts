import type { AdminRole } from './admin-api';

/** What each admin role may change (the API checks the same rules; this only hides buttons). */
export const can = {
  manage: (role: AdminRole) => role === 'admin',
  changeCommission: (role: AdminRole) => role === 'admin' || role === 'finance',
  invite: (role: AdminRole) => role === 'admin' || role === 'support',
};
