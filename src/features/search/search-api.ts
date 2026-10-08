import { queryOptions } from '@tanstack/react-query';

import { api, unwrap, type Schemas } from '@/lib/api-client';

export type PaymentLookup = Schemas['PaymentLookupDto'];
export type PersonLookup = Schemas['PersonLookupDto'];

/** An email address finds a person, anything else a payment reference (e.g. "DA7-5330"). */
export function isEmail(query: string): boolean {
  return query.includes('@');
}

export const paymentLookupQuery = (reference: string) =>
  queryOptions({
    queryKey: ['lookup', 'payment', reference.toUpperCase()],
    queryFn: async () => unwrap(await api.GET('/v1/admin/payments/{reference}', { params: { path: { reference } } })),
    retry: false,
  });

export const personLookupQuery = (email: string) =>
  queryOptions({
    queryKey: ['lookup', 'person', email.toLowerCase()],
    queryFn: async () => unwrap(await api.GET('/v1/admin/people', { params: { query: { email } } })),
    retry: false,
  });

export async function blockPerson(userId: string, reason: string): Promise<void> {
  unwrap(await api.PUT('/v1/admin/people/{userId}/block', { params: { path: { userId } }, body: { reason } }));
}

export async function unblockPerson(userId: string): Promise<void> {
  unwrap(await api.DELETE('/v1/admin/people/{userId}/block', { params: { path: { userId } } }));
}
