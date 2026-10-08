import { formatDay } from '@/lib/berlin-date';
import { formatCents } from '@/lib/format';

import type { Dashboard } from './dashboard-api';

/** Bars for the payment volume of the last 30 days; hover shows the day's numbers. */
export function DayChart({ days }: { days: Dashboard['days'] }) {
  const max = Math.max(...days.map((day) => day.volumeCents), 1);
  return (
    <div>
      <div className="flex h-40 items-end gap-1" role="img" aria-label="Umsatz der letzten 30 Tage">
        {days.map((day) => (
          <div key={day.day} className="group relative flex h-full flex-1 items-end">
            <div
              className="w-full rounded-t-sm bg-brand-gradient opacity-80 group-hover:opacity-100"
              style={{ height: `${Math.max((day.volumeCents / max) * 100, day.payments ? 2 : 0)}%` }}
            />
            <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 rounded-lg bg-ink px-2 py-1 text-xs whitespace-nowrap text-white group-hover:block">
              {formatDay(day.day)}: {formatCents(day.volumeCents)} · {day.payments} Zahlungen
            </div>
          </div>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-xs text-ink-muted">
        <span>{formatDay(days[0].day)}</span>
        <span>heute</span>
      </div>
    </div>
  );
}
