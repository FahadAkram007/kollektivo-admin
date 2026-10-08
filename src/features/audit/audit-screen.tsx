'use client';

import { infiniteQueryOptions, useInfiniteQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { api, unwrap, type Schemas } from '@/lib/api-client';
import { formatDateTime } from '@/lib/date-time';

import { ACTION_FILTERS, ACTION_LABELS, entityHref } from './audit-labels';

type AuditEntry = Schemas['AuditEntryDto'];

const auditQuery = (action: string) =>
  infiniteQueryOptions({
    queryKey: ['audit', action],
    queryFn: async ({ pageParam }) =>
      unwrap(
        await api.GET('/v1/admin/audit', { params: { query: { action: action || undefined, before: pageParam } } }),
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.nextBefore ?? undefined,
  });

/** "Protokoll": who changed or looked at what, and when. Entries are never changed or deleted. */
export function AuditScreen() {
  const [action, setAction] = useState('');
  const log = useInfiniteQuery(auditQuery(action));

  return (
    <div className="flex flex-col gap-4 px-4 pb-8 md:px-8">
      <div className="flex flex-wrap gap-2">
        {ACTION_FILTERS.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setAction(filter.value)}
            className={`min-h-10 rounded-full border px-4 text-sm ${
              action === filter.value ? 'border-brand-purple bg-brand-purple text-white' : 'border-line bg-white'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>
      {log.isPending ? (
        <Spinner />
      ) : log.isError ? (
        <p className="text-ink-muted">Das Protokoll konnte nicht geladen werden.</p>
      ) : (
        <>
          <ul className="flex flex-col divide-y divide-line rounded-xl border border-line">
            {log.data.pages
              .flatMap((page) => page.items)
              .map((entry) => (
                <Entry key={entry.id} entry={entry} />
              ))}
          </ul>
          {log.hasNextPage && (
            <Button
              variant="secondary"
              className="self-center"
              disabled={log.isFetchingNextPage}
              onClick={() => void log.fetchNextPage()}
            >
              Ältere laden
            </Button>
          )}
        </>
      )}
    </div>
  );
}

function Entry({ entry }: { entry: AuditEntry }) {
  const href = entityHref(entry.entity, entry.entityId, entry.entityLabel);
  const details = Object.entries(entry.details);
  return (
    <li className="flex flex-col gap-1 p-3 text-sm">
      <div className="flex flex-wrap items-baseline gap-x-2">
        <span className="font-medium">{ACTION_LABELS[entry.action] ?? entry.action}</span>
        {entry.entityLabel &&
          (href ? (
            <Link href={href} className="text-brand-purple hover:underline">
              {entry.entityLabel}
            </Link>
          ) : (
            <span>{entry.entityLabel}</span>
          ))}
        <span className="ml-auto text-xs text-ink-muted tabular-nums">{formatDateTime(entry.createdAt)}</span>
      </div>
      <p className="text-xs text-ink-muted">von {entry.actor}</p>
      {details.length > 0 && (
        <details className="text-xs text-ink-muted">
          <summary className="cursor-pointer">Details</summary>
          <pre className="mt-1 overflow-x-auto rounded-lg bg-surface p-2 whitespace-pre-wrap">
            {JSON.stringify(entry.details, null, 2)}
          </pre>
        </details>
      )}
    </li>
  );
}
