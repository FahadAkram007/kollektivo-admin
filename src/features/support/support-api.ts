import { queryOptions } from '@tanstack/react-query';

import { api, unwrap, type Schemas } from '@/lib/api-client';

export type TicketRow = Schemas['TicketRowDto'];
export type TicketDetail = Schemas['TicketDetailDto'];
export type TicketStatus = TicketRow['status'];

export const ticketsQuery = (status: string, search: string) =>
  queryOptions({
    queryKey: ['tickets', status, search],
    queryFn: async () =>
      unwrap(
        await api.GET('/v1/admin/tickets', {
          params: { query: { status: (status || undefined) as TicketStatus | undefined, search: search || undefined } },
        }),
      ),
    refetchInterval: 60_000,
  });

export const ticketQuery = (ticketId: string) =>
  queryOptions({
    queryKey: ['ticket', ticketId],
    queryFn: async () => unwrap(await api.GET('/v1/admin/tickets/{ticketId}', { params: { path: { ticketId } } })),
  });

export async function replyToTicket(ticketId: string, body: string, close: boolean): Promise<void> {
  unwrap(
    await api.POST('/v1/admin/tickets/{ticketId}/replies', { params: { path: { ticketId } }, body: { body, close } }),
  );
}

export async function setTicketStatus(ticketId: string, status: TicketStatus): Promise<void> {
  unwrap(await api.PATCH('/v1/admin/tickets/{ticketId}', { params: { path: { ticketId } }, body: { status } }));
}
