'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

import { SectionCard } from '@/components/ui/section-card';
import { Spinner } from '@/components/ui/spinner';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatDateTime } from '@/lib/date-time';
import { formatCents } from '@/lib/format';
import { badge, PAYMENT_STATUS, percent, TICKET_STATUS } from '@/lib/labels';

import { paymentLookupQuery } from './search-api';

export function PaymentResult({ reference }: { reference: string }) {
  const payment = useQuery(paymentLookupQuery(reference));
  if (payment.isPending) return <Spinner />;
  if (payment.isError) return <p className="text-ink-muted">Keine Zahlung mit der Referenz „{reference}“.</p>;
  const p = payment.data;
  const rest = p.purchaseTotalCents - p.amountCents;

  return (
    <SectionCard title={`Zahlung ${p.reference}`}>
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge {...badge(PAYMENT_STATUS, p.status)} />
        <span className="text-sm text-ink-muted">
          {p.method === 'till' ? 'Code von der Kasse' : 'Gedruckter QR-Code'} · {formatDateTime(p.createdAt)}
        </span>
      </div>
      <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
        <Row label="Mit Guthaben bezahlt" value={formatCents(p.amountCents)} />
        <Row
          label="Einkauf gesamt"
          value={`${formatCents(p.purchaseTotalCents)}${rest > 0 ? ` (Rest ${formatCents(rest)} an der Kasse)` : ''}`}
        />
        <Row label="Provision" value={percent(p.commissionBps)} />
        <Row label="Abgeschlossen" value={p.completedAt ? formatDateTime(p.completedAt) : '–'} />
        <Row
          label="Laden"
          value={
            <Link href={`/laeden/${p.partnerId}`} className="text-brand-purple hover:underline">
              {p.shopName}
            </Link>
          }
        />
        <Row label="Adresse" value={p.shopAddress} />
        <Row
          label="Bezahlt von"
          value={
            <Link href={`/suche?q=${encodeURIComponent(p.personEmail)}`} className="text-brand-purple hover:underline">
              {p.personName}
            </Link>
          }
        />
        <Row label="Arbeitgeber" value={p.employer} />
        <Row label="Buchung" value={<span className="font-mono text-xs">{p.ledgerTxId ?? '–'}</span>} />
      </dl>
      {p.tickets.length > 0 && (
        <div className="text-sm">
          <p className="font-medium">Tickets zu dieser Zahlung</p>
          {p.tickets.map((ticket) => (
            <Link key={ticket.id} href={`/support/${ticket.id}`} className="mr-3 text-brand-purple hover:underline">
              {ticket.number} ({badge(TICKET_STATUS, ticket.status).label})
            </Link>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-ink-muted">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
