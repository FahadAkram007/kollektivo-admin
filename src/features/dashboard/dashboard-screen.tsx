'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

import { SectionCard } from '@/components/ui/section-card';
import { Spinner } from '@/components/ui/spinner';
import { formatCents } from '@/lib/format';

import { changePercent, dashboardQuery, type Dashboard } from './dashboard-api';
import { DayChart } from './day-chart';

/** The admin start page: how KollektivO is doing. */
export function DashboardScreen() {
  const dashboard = useQuery(dashboardQuery);
  if (dashboard.isPending) return <Spinner />;
  if (dashboard.isError) return <p className="px-4 text-ink-muted md:px-8">Die Zahlen konnten nicht geladen werden.</p>;
  const d = dashboard.data;

  return (
    <div className="flex flex-col gap-5 px-4 pb-8 md:px-8">
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Aktive Mitarbeitende" value={String(d.activeEmployees)} />
        <Stat label="Aktive Firmen" value={String(d.activeCompanies)} href="/firmen" />
        <Stat label="Aktive Läden" value={String(d.activeShops)} href="/laeden" />
        <Stat label="Offene Tickets" value={String(d.openTickets)} href="/support" alert={d.openTickets > 0} />
      </dl>

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Umsatz heute" value={formatCents(d.today.volumeCents)} hint={`${d.today.payments} Zahlungen`} />
        <MonthStat
          label="Umsatz diesen Monat"
          current={d.thisMonth.volumeCents}
          previous={d.lastMonth.volumeCents}
          hint={`${d.thisMonth.payments} Zahlungen`}
        />
        <MonthStat
          label="Provision diesen Monat"
          current={d.thisMonth.commissionCents}
          previous={d.lastMonth.commissionCents}
        />
        <MonthStat
          label="Gutgeschrieben diesen Monat"
          current={d.thisMonth.creditedCents}
          previous={d.lastMonth.creditedCents}
        />
      </dl>

      <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
        <SectionCard title="Umsatz der letzten 30 Tage">
          <DayChart days={d.days} />
        </SectionCard>
        <SectionCard title="Top-Läden diesen Monat">
          {d.topShops.length === 0 ? (
            <p className="text-sm text-ink-muted">Noch keine Zahlungen in diesem Monat.</p>
          ) : (
            <ol className="flex flex-col gap-2 text-sm">
              {d.topShops.map((shop, index) => (
                <li key={shop.partnerId} className="flex items-center gap-3">
                  <span className="w-5 text-ink-muted">{index + 1}.</span>
                  <Link
                    href={`/laeden/${shop.partnerId}`}
                    className="flex-1 truncate text-brand-purple hover:underline"
                  >
                    {shop.name}
                  </Link>
                  <span className="tabular-nums">{formatCents(shop.volumeCents)}</span>
                </li>
              ))}
            </ol>
          )}
        </SectionCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <SectionCard title="Geld im System" description="Stand jetzt, aus der Buchhaltung (Ledger).">
          <dl className="grid grid-cols-2 gap-3">
            <Stat
              label="Guthaben der Mitarbeitenden"
              value={formatCents(d.walletBalanceCents)}
              hint="Noch nicht ausgegeben; Rest geht am Monatsende an die Arbeitgeber"
            />
            <Stat label="Offen an Läden" value={formatCents(d.owedToShopsCents)} hint="Noch nicht ausgezahlt" />
          </dl>
        </SectionCard>
        <ZagCard zag={d.zag} />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  href,
  alert = false,
}: {
  label: string;
  value: string;
  hint?: string;
  href?: string;
  alert?: boolean;
}) {
  const content = (
    <>
      <dt className="text-xs text-ink-muted">{label}</dt>
      <dd className={`text-2xl font-bold tabular-nums ${alert ? 'text-error' : ''}`}>{value}</dd>
      {hint && <dd className="text-xs text-ink-muted">{hint}</dd>}
    </>
  );
  return href ? (
    <Link href={href} className="rounded-xl bg-surface p-4 hover:bg-line">
      {content}
    </Link>
  ) : (
    <div className="rounded-xl bg-surface p-4">{content}</div>
  );
}

function MonthStat({
  label,
  current,
  previous,
  hint,
}: {
  label: string;
  current: number;
  previous: number;
  hint?: string;
}) {
  const change = changePercent(current, previous);
  const comparison =
    change === null ? 'Vormonat: –' : `${change >= 0 ? '+' : ''}${change} % zum Vormonat (${formatCents(previous)})`;
  return <Stat label={label} value={formatCents(current)} hint={[hint, comparison].filter(Boolean).join(' · ')} />;
}

/** Payment volume of the last 12 months against the 1 million euro limit of the limited-network exemption. */
function ZagCard({ zag }: { zag: Dashboard['zag'] }) {
  const width = Math.min(zag.percent, 100);
  return (
    <SectionCard
      title="ZAG-Grenze (begrenztes Netz)"
      description="Zahlungsvolumen der letzten 12 Monate. Ab 1 Mio. € muss das Geschäft der BaFin angezeigt werden (§ 2 Abs. 1 Nr. 10 ZAG)."
    >
      <p className="text-2xl font-bold tabular-nums">
        {formatCents(zag.volumeCents)}{' '}
        <span className="text-base font-normal text-ink-muted">von {formatCents(zag.limitCents)}</span>
      </p>
      <div className="h-3 overflow-hidden rounded-full bg-line" role="img" aria-label={`${zag.percent} % der Grenze`}>
        <div className={`h-full ${zag.warning ? 'bg-error' : 'bg-brand-gradient'}`} style={{ width: `${width}%` }} />
      </div>
      <p className={`text-sm ${zag.warning ? 'font-bold text-error' : 'text-ink-muted'}`}>
        {zag.percent.toLocaleString('de-DE')} % der Grenze
        {zag.warning ? ' – Anzeige bei der BaFin mit dem Anwalt vorbereiten.' : ''}
      </p>
    </SectionCard>
  );
}
