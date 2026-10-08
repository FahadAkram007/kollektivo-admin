'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';

import { Spinner } from '@/components/ui/spinner';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatDateTime } from '@/lib/date-time';
import { badge, TICKET_STATUS, TICKET_TOPIC } from '@/lib/labels';

import { ticketsQuery } from './support-api';

const FILTERS = [
  { value: '', label: 'Nicht erledigt' },
  { value: 'open', label: 'Offen' },
  { value: 'waiting', label: 'Wartet' },
  { value: 'answered', label: 'Beantwortet' },
  { value: 'closed', label: 'Geschlossen' },
];

/** Support requests from the app, newest activity first. */
export function TicketListScreen() {
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const tickets = useQuery(ticketsQuery(status, search.trim()));

  return (
    <div className="flex flex-col gap-4 px-4 pb-8 md:px-8">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setStatus(filter.value)}
            className={`min-h-10 rounded-full border px-4 text-sm ${
              status === filter.value ? 'border-brand-purple bg-brand-purple text-white' : 'border-line bg-white'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>
      <input
        type="search"
        placeholder="Suchen: Ticketnummer, E-Mail oder Zahlungsreferenz"
        aria-label="Tickets suchen"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="min-h-11 rounded-xl border border-line px-4 outline-none focus:border-brand-purple"
      />
      {tickets.isPending ? (
        <Spinner />
      ) : tickets.isError ? (
        <p className="text-ink-muted">Die Tickets konnten nicht geladen werden.</p>
      ) : tickets.data.length === 0 ? (
        <p className="rounded-xl bg-surface p-6 text-center text-ink-muted">Keine Tickets. 🎉</p>
      ) : (
        <ul className="flex flex-col divide-y divide-line rounded-xl border border-line">
          {tickets.data.map((ticket) => (
            <li key={ticket.id}>
              <Link href={`/support/${ticket.id}`} className="flex flex-col gap-1 p-4 hover:bg-surface">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-bold">{ticket.number}</span>
                  <StatusBadge {...badge(TICKET_STATUS, ticket.status)} />
                  <span className="text-ink-muted">
                    {TICKET_TOPIC[ticket.topic] ?? ticket.topic}
                    {ticket.paymentReference ? ` · Zahlung ${ticket.paymentReference}` : ''}
                  </span>
                  <span className="ml-auto text-xs text-ink-muted">{formatDateTime(ticket.updatedAt)}</span>
                </div>
                <p className="text-sm">
                  <span className="font-medium">{ticket.fromName}</span>
                  <span className="text-ink-muted">
                    {' '}
                    · {ticket.fromEmail}
                    {ticket.employer ? ` · ${ticket.employer}` : ''}
                  </span>
                </p>
                <p className="line-clamp-2 text-sm text-ink-muted">{ticket.preview}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
