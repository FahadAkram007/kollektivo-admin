'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { SectionCard } from '@/components/ui/section-card';
import { Spinner } from '@/components/ui/spinner';
import { StatusBadge } from '@/components/ui/status-badge';
import { TextField } from '@/components/ui/text-field';
import { formatDay } from '@/lib/berlin-date';
import { formatDateTime } from '@/lib/date-time';
import { formatCents } from '@/lib/format';
import { badge, EMPLOYMENT_STATUS, PAYMENT_STATUS, TICKET_STATUS } from '@/lib/labels';
import { ActionFeedback, useAction } from '@/lib/use-action';

import { blockPerson, personLookupQuery, unblockPerson, type PersonLookup } from './search-api';

export function PersonResult({ email }: { email: string }) {
  const person = useQuery(personLookupQuery(email));
  if (person.isPending) return <Spinner />;
  if (person.isError) return <p className="text-ink-muted">Kein Konto mit der E-Mail-Adresse „{email}“.</p>;
  const p = person.data;

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <div className="flex flex-col gap-5">
        <SectionCard title={`${p.firstName} ${p.lastName}`.trim() || p.email}>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <StatusBadge
              {...(p.status === 'blocked'
                ? { label: 'Konto gesperrt', tone: 'bad' }
                : { label: 'Konto aktiv', tone: 'good' })}
            />
            <span className="text-ink-muted">
              {p.email} · seit {formatDay(p.createdAt.slice(0, 10))}
              {p.hasPaymentPin ? ' · PIN gesetzt' : ' · keine PIN'}
              {p.adminRole ? ` · Admin (${p.adminRole})` : ''}
            </span>
          </div>
          {p.employments.map((employment) => (
            <div key={employment.employeeId} className="rounded-xl bg-surface p-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Link
                  href={`/firmen/${employment.employerId}`}
                  className="font-medium text-brand-purple hover:underline"
                >
                  {employment.employer}
                </Link>
                <StatusBadge {...badge(EMPLOYMENT_STATUS, employment.status)} />
              </div>
              <p className="text-ink-muted">
                Guthaben {formatCents(employment.balanceCents)} · Monatsbetrag{' '}
                {formatCents(employment.monthlyAmountCents)}
                {employment.personnelNumber ? ` · Pers.-Nr. ${employment.personnelNumber}` : ''}
                {employment.benefitEndsOn ? ` · bis ${formatDay(employment.benefitEndsOn)}` : ''}
              </p>
            </div>
          ))}
          {(p.shops.length > 0 || p.companies.length > 0) && (
            <p className="text-sm text-ink-muted">
              Zugänge:{' '}
              {[
                ...p.shops.map((shop) => (
                  <Link key={shop.id} href={`/laeden/${shop.id}`} className="text-brand-purple hover:underline">
                    {shop.name} ({shop.role})
                  </Link>
                )),
                ...p.companies.map((company) => (
                  <Link key={company.id} href={`/firmen/${company.id}`} className="text-brand-purple hover:underline">
                    {company.name} ({company.role})
                  </Link>
                )),
              ].map((link, index) => (
                <span key={index}>
                  {index > 0 && ', '}
                  {link}
                </span>
              ))}
            </p>
          )}
        </SectionCard>
        <BlockBox key={p.status} person={p} />
      </div>
      <div className="flex flex-col gap-5">
        <SectionCard title="Letzte Zahlungen">
          {p.payments.length === 0 ? (
            <p className="text-sm text-ink-muted">Keine Zahlungen.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-line text-sm">
              {p.payments.map((payment) => (
                <li key={payment.reference} className="flex items-center justify-between gap-3 py-2">
                  <Link href={`/suche?q=${payment.reference}`} className="text-brand-purple hover:underline">
                    {payment.reference}
                  </Link>
                  <span className="truncate text-ink-muted">{payment.shopName}</span>
                  <span className="tabular-nums">{formatCents(payment.amountCents)}</span>
                  <StatusBadge {...badge(PAYMENT_STATUS, payment.status)} />
                  <span className="text-xs text-ink-muted">{formatDateTime(payment.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
        <SectionCard title="Tickets">
          {p.tickets.length === 0 ? (
            <p className="text-sm text-ink-muted">Keine Tickets.</p>
          ) : (
            p.tickets.map((ticket) => (
              <Link
                key={ticket.id}
                href={`/support/${ticket.id}`}
                className="text-sm text-brand-purple hover:underline"
              >
                {ticket.number} · {badge(TICKET_STATUS, ticket.status).label} · {formatDateTime(ticket.createdAt)}
              </Link>
            ))
          )}
        </SectionCard>
      </div>
    </div>
  );
}

/** Blocks the whole account (every employer): no payments, signed out everywhere. */
function BlockBox({ person }: { person: PersonLookup }) {
  const [reason, setReason] = useState('');
  const action = useAction([personLookupQuery(person.email).queryKey]);

  if (person.status === 'blocked') {
    return (
      <SectionCard title="Konto gesperrt" description="Keine Zahlungen möglich.">
        <Button
          variant="secondary"
          className="self-start"
          disabled={action.busy}
          onClick={() => void action.run(() => unblockPerson(person.userId), 'Entsperrt.')}
        >
          Konto entsperren
        </Button>
        <ActionFeedback state={action.state} />
      </SectionCard>
    );
  }
  return (
    <SectionCard
      title="Konto sperren"
      description="Sperrt das ganze Konto (bei allen Arbeitgebern) und meldet die Person überall ab. Nur eine Firma betreffend: das macht HR im Firmenportal."
    >
      <form
        className="flex flex-col gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (window.confirm('Konto wirklich sperren?'))
            void action.run(() => blockPerson(person.userId, reason.trim()), 'Gesperrt.');
        }}
      >
        <TextField
          label="Grund (für das Protokoll)"
          required
          minLength={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <div className="flex items-center gap-3">
          <Button type="submit" variant="danger" disabled={action.busy}>
            Konto sperren
          </Button>
          <ActionFeedback state={action.state} />
        </div>
      </form>
    </SectionCard>
  );
}
