import { queryOptions } from '@tanstack/react-query';

import { api, unwrap, type Schemas } from '@/lib/api-client';

export type ShopRow = Schemas['AdminShopRowDto'];
export type ShopDetail = Schemas['AdminShopDetailDto'];
export type NewShop = Schemas['CreateAdminShopDto'];
export type ShopLocation = Schemas['AdminShopLocationDto'];

export const shopsQuery = (search: string, status: string) =>
  queryOptions({
    queryKey: ['shops', search, status],
    queryFn: async () =>
      unwrap(
        await api.GET('/v1/admin/shops', {
          params: { query: { search: search || undefined, status: (status || undefined) as never } },
        }),
      ),
  });

export const shopQuery = (partnerId: string) =>
  queryOptions({
    queryKey: ['shop', partnerId],
    queryFn: async () => unwrap(await api.GET('/v1/admin/shops/{partnerId}', { params: { path: { partnerId } } })),
  });

export const categoriesQuery = queryOptions({
  queryKey: ['categories'],
  queryFn: async () => unwrap(await api.GET('/v1/admin/categories')),
  staleTime: Infinity,
});

export const regionsQuery = queryOptions({
  queryKey: ['regions'],
  queryFn: async () => unwrap(await api.GET('/v1/admin/regions')),
  staleTime: Infinity,
});

const path = (partnerId: string) => ({ params: { path: { partnerId } } });

export async function createShop(shop: NewShop): Promise<string> {
  return unwrap(await api.POST('/v1/admin/shops', { body: shop })).id;
}

export async function updateShop(partnerId: string, changes: Schemas['UpdateAdminShopDto']): Promise<void> {
  unwrap(await api.PATCH('/v1/admin/shops/{partnerId}', { ...path(partnerId), body: changes }));
}

export async function updateLocation(
  partnerId: string,
  locationId: string,
  changes: Schemas['UpdateAdminLocationDto'],
): Promise<void> {
  unwrap(
    await api.PATCH('/v1/admin/shops/{partnerId}/locations/{locationId}', {
      params: { path: { partnerId, locationId } },
      body: changes,
    }),
  );
}

export async function changeCommission(partnerId: string, change: Schemas['ChangeCommissionDto']): Promise<void> {
  unwrap(await api.POST('/v1/admin/shops/{partnerId}/commission', { ...path(partnerId), body: change }));
}

export async function inviteShopMember(partnerId: string, member: Schemas['AdminInviteMemberDto']): Promise<void> {
  unwrap(await api.POST('/v1/admin/shops/{partnerId}/members', { ...path(partnerId), body: member }));
}
