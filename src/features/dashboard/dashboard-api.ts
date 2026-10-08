import { queryOptions } from '@tanstack/react-query';

import { api, unwrap, type Schemas } from '@/lib/api-client';

export type Dashboard = Schemas['DashboardDto'];

export const dashboardQuery = queryOptions({
  queryKey: ['dashboard'],
  queryFn: async () => unwrap(await api.GET('/v1/admin/dashboard')),
  refetchInterval: 60_000,
});

/** Change from last month in percent, or null when last month had nothing to compare with. */
export function changePercent(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}
