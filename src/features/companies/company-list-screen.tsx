'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';

import { buttonClass } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { StatusBadge } from '@/components/ui/status-badge';
import { useAdmin } from '@/features/shell/admin-shell';
import { can } from '@/features/shell/permissions';
import { COMPANY_STATUS } from '@/lib/labels';

import { companiesQuery } from './companies-api';

const FILTERS = [
  { value: '', label: 'Alle' },
  { value: 'active', label: 'Aktiv' },
  { value: 'ended', label: 'Beendet' },
];

/** All employer companies with search and status filter. */
export function CompanyListScreen() {
  const { role } = useAdmin();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const companies = useQuery(companiesQuery(search.trim(), status));

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
          <Link href="/firmen/neu" className={buttonClass()}>
            Neue Firma
          </Link>
        )}
      </div>
      <input
        type="search"
        placeholder="Suchen: Name, Ort oder E-Mail aus dem HR-Team"
        aria-label="Firmen suchen"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="min-h-11 rounded-xl border border-line px-4 outline-none focus:border-brand-purple"
      />
      {companies.isPending ? (
        <Spinner />
      ) : companies.isError ? (
        <p className="text-ink-muted">Die Firmen konnten nicht geladen werden.</p>
      ) : companies.data.length === 0 ? (
        <p className="rounded-xl bg-surface p-6 text-center text-ink-muted">Keine Firmen gefunden.</p>
      ) : (
        <table className="w-full text-sm">
          <thead className="border-b border-line text-left text-ink-muted">
            <tr>
              <th className="py-2 font-medium">Firma</th>
              <th className="py-2 font-medium">Ort</th>
              <th className="py-2 font-medium">Status</th>
              <th className="py-2 text-right font-medium">Aktive Mitarbeitende</th>
              <th className="py-2 text-right font-medium">Offene Einladungen</th>
            </tr>
          </thead>
          <tbody>
            {companies.data.map((company) => (
              <tr key={company.employerId} className="border-b border-line hover:bg-surface">
                <td className="py-2.5">
                  <Link
                    href={`/firmen/${company.employerId}`}
                    className="font-medium text-brand-purple hover:underline"
                  >
                    {company.name}
                  </Link>
                </td>
                <td className="py-2.5">{company.city}</td>
                <td className="py-2.5">
                  <StatusBadge {...(COMPANY_STATUS[company.status] ?? { label: company.status, tone: 'neutral' })} />
                </td>
                <td className="py-2.5 text-right tabular-nums">{company.activeEmployees}</td>
                <td className="py-2.5 text-right tabular-nums">{company.openInvites}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
