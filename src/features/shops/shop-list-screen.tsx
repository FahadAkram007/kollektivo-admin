'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';

import { buttonClass } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { StatusBadge } from '@/components/ui/status-badge';
import { useAdmin } from '@/features/shell/admin-shell';
import { can } from '@/features/shell/permissions';
import { formatCents } from '@/lib/format';
import { percent, SHOP_STATUS } from '@/lib/labels';

import { shopsQuery } from './shops-api';

const FILTERS = [
  { value: '', label: 'Alle' },
  { value: 'active', label: 'Aktiv' },
  { value: 'suspended', label: 'Gesperrt' },
  { value: 'applied', label: 'Beworben' },
];

/** All partner shops with search, status filter and this month's numbers. */
export function ShopListScreen() {
  const { role } = useAdmin();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const shops = useQuery(shopsQuery(search.trim(), status));

  return (
    <div className="flex flex-col gap-4 px-4 pb-8 md:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
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
        {can.manage(role) && (
          <Link href="/laeden/neu" className={buttonClass()}>
            Neuer Laden
          </Link>
        )}
      </div>
      <input
        type="search"
        placeholder="Suchen: Name, Ort oder E-Mail eines Teammitglieds"
        aria-label="Läden suchen"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="min-h-11 rounded-xl border border-line px-4 outline-none focus:border-brand-purple"
      />
      {shops.isPending ? (
        <Spinner />
      ) : shops.isError ? (
        <p className="text-ink-muted">Die Läden konnten nicht geladen werden.</p>
      ) : shops.data.length === 0 ? (
        <p className="rounded-xl bg-surface p-6 text-center text-ink-muted">Keine Läden gefunden.</p>
      ) : (
        <table className="w-full text-sm">
          <thead className="border-b border-line text-left text-ink-muted">
            <tr>
              <th className="py-2 font-medium">Laden</th>
              <th className="py-2 font-medium">Ort</th>
              <th className="py-2 font-medium">Status</th>
              <th className="py-2 text-right font-medium">Provision</th>
              <th className="py-2 text-right font-medium">Zahlungen (Monat)</th>
              <th className="py-2 text-right font-medium">Umsatz (Monat)</th>
            </tr>
          </thead>
          <tbody>
            {shops.data.map((shop) => (
              <tr key={shop.partnerId} className="border-b border-line hover:bg-surface">
                <td className="py-2.5">
                  <Link href={`/laeden/${shop.partnerId}`} className="font-medium text-brand-purple hover:underline">
                    {shop.name}
                  </Link>
                  <p className="text-xs text-ink-muted">
                    {shop.category}
                    {shop.locationCount > 1 ? ` · ${shop.locationCount} Filialen` : ''}
                  </p>
                </td>
                <td className="py-2.5">{shop.city}</td>
                <td className="py-2.5">
                  <StatusBadge {...(SHOP_STATUS[shop.status] ?? { label: shop.status, tone: 'neutral' })} />
                </td>
                <td className="py-2.5 text-right tabular-nums">{percent(shop.commissionBps)}</td>
                <td className="py-2.5 text-right tabular-nums">{shop.paymentsThisMonth}</td>
                <td className="py-2.5 text-right tabular-nums">{formatCents(shop.volumeThisMonthCents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
