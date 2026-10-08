const format = new Intl.DateTimeFormat('de-DE', {
  timeZone: 'Europe/Berlin',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

/** ISO time → "08.10.2026, 14:05" (German time). */
export function formatDateTime(iso: string): string {
  return format.format(new Date(iso));
}
