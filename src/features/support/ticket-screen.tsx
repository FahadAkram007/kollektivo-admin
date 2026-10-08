'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { SectionCard } from '@/components/ui/section-card';
import { SelectField } from '@/components/ui/select-field';
import { Spinner } from '@/components/ui/spinner';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatDateTime } from '@/lib/date-time';
import { badge, TICKET_STATUS, TICKET_TOPIC } from '@/lib/labels';
import { ActionFeedback, useAction } from '@/lib/use-action';

import { replyToTicket, setTicketStatus, ticketQuery, type TicketDetail, type TicketStatus } from './support-api';

/** One ticket: the conversation, who asked, and the answer box. */
export function TicketScreen() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const ticket = useQuery(ticketQuery(ticketId));

  if (ticket.isPending) return <Spinner />;
  if (ticket.isError) return <p className="px-4 text-ink-muted md:px-8">Das Ticket konnte nicht geladen werden.</p>;
  const data = ticket.data;

  return (
    <div className="flex flex-col gap-5 px-4 pb-8 md:px-8">
      <Link href="/support" className="text-sm text-brand-purple hover:underline">
        ← Alle Tickets
      </Link>
      <header className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">{data.number}</h1>
        <StatusBadge {...badge(TICKET_STATUS, data.status)} />
        <span className="text-sm text-ink-muted">
          {TICKET_TOPIC[data.topic] ?? data.topic} · eröffnet {formatDateTime(data.createdAt)}
        </span>
      </header>
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-4">
          <ol className="flex flex-col gap-3">
            {data.messages.map((message) => (
              <li
                key={message.id}
                className={`rounded-2xl p-4 ${message.isStaff ? 'ml-8 bg-surface' : 'mr-8 border border-line bg-white'}`}
              >
                <p className="mb-1 text-xs text-ink-muted">
                  {message.authorName} · {formatDateTime(message.createdAt)}
                </p>
                <p className="text-sm whitespace-pre-wrap">{message.body}</p>
              </li>
            ))}
          </ol>
          {data.status !== 'closed' && <ReplyBox ticket={data} />}
        </div>
        <aside className="flex flex-col gap-4">
          <SectionCard title="Von">
            <div className="text-sm">
              <p className="font-medium">{data.fromName}</p>
              <p className="text-ink-muted">{data.fromEmail}</p>
              {data.employer && <p className="text-ink-muted">{data.employer}</p>}
            </div>
            <Link
              href={`/suche?q=${encodeURIComponent(data.fromEmail)}`}
              className="text-sm text-brand-purple hover:underline"
            >
              Person ansehen →
            </Link>
            {data.paymentReference && (
              <Link
                href={`/suche?q=${encodeURIComponent(data.paymentReference)}`}
                className="text-sm text-brand-purple hover:underline"
              >
                Zahlung {data.paymentReference} ansehen →
              </Link>
            )}
          </SectionCard>
          <StatusBox key={data.status} ticket={data} />
        </aside>
      </div>
    </div>
  );
}

function ReplyBox({ ticket }: { ticket: TicketDetail }) {
  const [body, setBody] = useState('');
  const action = useAction([ticketQuery(ticket.id).queryKey, ['tickets']]);

  function send(close: boolean) {
    void action
      .run(
        () => replyToTicket(ticket.id, body.trim(), close),
        close ? 'Gesendet und geschlossen.' : 'Antwort gesendet.',
      )
      .then((ok) => ok && setBody(''));
  }

  return (
    <SectionCard
      title="Antworten"
      description={`Geht per E-Mail an ${ticket.fromEmail}. Antworten darauf landen im Support-Postfach.`}
    >
      <textarea
        rows={6}
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder={`Hallo ${ticket.fromName.split(' ')[0]}, …`}
        className="rounded-xl border border-line p-3 text-sm outline-none focus:border-brand-purple"
      />
      <div className="flex flex-wrap items-center gap-3">
        <Button disabled={action.busy || body.trim().length < 2} onClick={() => send(false)}>
          Antworten
        </Button>
        <Button variant="secondary" disabled={action.busy || body.trim().length < 2} onClick={() => send(true)}>
          Antworten und schließen
        </Button>
        <ActionFeedback state={action.state} />
      </div>
    </SectionCard>
  );
}

function StatusBox({ ticket }: { ticket: TicketDetail }) {
  const action = useAction([ticketQuery(ticket.id).queryKey, ['tickets']]);
  return (
    <SectionCard title="Status">
      <SelectField
        label="Status ändern"
        value={ticket.status}
        disabled={action.busy}
        onChange={(event) => void action.run(() => setTicketStatus(ticket.id, event.target.value as TicketStatus))}
        options={Object.entries(TICKET_STATUS).map(([value, { label }]) => ({ value, label }))}
      />
      <ActionFeedback state={action.state} />
    </SectionCard>
  );
}
