import { queryOptions } from '@tanstack/react-query';

import { api, unwrap, type Schemas } from '@/lib/api-client';

export type AdminMe = Schemas['AdminMeDto'];
export type AdminRole = AdminMe['role'];

export const adminMeQuery = queryOptions({
  queryKey: ['admin', 'me'],
  queryFn: async () => unwrap(await api.GET('/v1/admin/me')),
  staleTime: 60 * 1000,
  retry: false,
});
