'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { SectionCard } from '@/components/ui/section-card';
import { Spinner } from '@/components/ui/spinner';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatDay } from '@/lib/berlin-date';
import { formatCents } from '@/lib/format';
import { SHOP_STATUS } from '@/lib/labels';

import { CommissionSection } from './commission-section';
import { LocationsSection } from './locations-section';
import { MasterDataSection } from './master-data-section';
import { MembersSection } from './members-section';
import { shopQuery, type ShopDetail } from './shops-api';

/** Everything about one shop for the KollektivO team. */
export function ShopDetailScreen() {
  const { partnerId } = useParams<{ partnerId: string }>();
  const shop = useQuery(shopQuery(partnerId));

  if (shop.isPending) return <Spinner />;
  if (shop.isError) return <p className="px-4 text-ink-muted md:px-8">Der Laden konnte nicht geladen werden.</p>;
  const data = shop.data;

  return (
    <div className="flex flex-col gap-5 px-4 pb-8 md:px-8">
      <Link href="/laeden" className="text-sm text-brand-purple hover:underline">
        ← Alle Läden
      </Link>
      <header className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">{data.displayName}</h1>
        <StatusBadge {...(SHOP_STATUS[data.status] ?? { label: data.status, tone: 'neutral' })} />
        <span className="text-sm text-ink-muted">
          {data.categoryName} · seit {formatDay(data.createdAt.slice(0, 10))}
        </span>
      </header>
      <Months shop={data} />
      <div className="grid gap-5 xl:grid-cols-2">
        <div className="flex flex-col gap-5">
          <MasterDataSection key={`${data.legalName}-${data.displayName}-${data.category}`} shop={data} />
          <CommissionSection shop={data} />
        </div>
        <div className="flex flex-col gap-5">
          <LocationsSection shop={data} />
          <MembersSection shop={data} />
        </div>
      </div>
    </div>
  );
}

function Months({ shop }: { shop: ShopDetail }) {
  return (
    <SectionCard title="Umsatz mit KollektivO">
      <dl className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {shop.months.map((month, index) => (
          <div key={month.period} className="rounded-xl bg-surface p-3">
            <dt className="text-xs text-ink-muted">{index === 0 ? 'Dieser Monat' : 'Letzter Monat'}</dt>
            <dd className="text-lg font-bold tabular-nums">{formatCents(month.volumeCents)}</dd>
            <dd className="text-xs text-ink-muted">
              {month.payments} Zahlungen · Provision {formatCents(month.commissionCents)}
            </dd>
          </div>
        ))}
      </dl>
    </SectionCard>
  );
}
