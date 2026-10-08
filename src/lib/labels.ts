import type { Tone } from '@/components/ui/status-badge';

export const SHOP_STATUS: Record<string, { label: string; tone: Tone }> = {
  applied: { label: 'Beworben', tone: 'warn' },
  in_review: { label: 'In Prüfung', tone: 'warn' },
  active: { label: 'Aktiv', tone: 'good' },
  suspended: { label: 'Gesperrt', tone: 'bad' },
};

export const LOCATION_STATUS: Record<string, { label: string; tone: Tone }> = {
  active: { label: 'Geöffnet', tone: 'good' },
  paused: { label: 'Pausiert', tone: 'warn' },
  closed: { label: 'Geschlossen', tone: 'neutral' },
};

export const COMPANY_STATUS: Record<string, { label: string; tone: Tone }> = {
  onboarding: { label: 'Einrichtung', tone: 'warn' },
  active: { label: 'Aktiv', tone: 'good' },
  ended: { label: 'Beendet', tone: 'neutral' },
};

/** 200 → "2 %", 150 → "1,5 %" */
export function percent(bps: number): string {
  return `${(bps / 100).toLocaleString('de-DE', { maximumFractionDigits: 2 })} %`;
}

export const TICKET_STATUS: Record<string, { label: string; tone: Tone }> = {
  open: { label: 'Offen', tone: 'bad' },
  waiting: { label: 'Wartet auf Rückmeldung', tone: 'warn' },
  answered: { label: 'Beantwortet', tone: 'good' },
  closed: { label: 'Geschlossen', tone: 'neutral' },
};

export const TICKET_TOPIC: Record<string, string> = {
  payment: 'Zahlung',
  balance: 'Guthaben',
  account: 'Konto',
  shops: 'Geschäfte',
  other: 'Sonstiges',
};

export const PAYMENT_STATUS: Record<string, { label: string; tone: Tone }> = {
  awaiting_shop: { label: 'Wartet auf Laden', tone: 'warn' },
  completed: { label: 'Bezahlt', tone: 'good' },
  declined: { label: 'Abgelehnt', tone: 'neutral' },
  timed_out: { label: 'Nicht angenommen', tone: 'neutral' },
  refunded: { label: 'Erstattet', tone: 'warn' },
  partially_refunded: { label: 'Teilweise erstattet', tone: 'warn' },
};

export const EMPLOYMENT_STATUS: Record<string, { label: string; tone: Tone }> = {
  invited: { label: 'Eingeladen', tone: 'warn' },
  active: { label: 'Aktiv', tone: 'good' },
  leaving: { label: 'Scheidet aus', tone: 'warn' },
  ended: { label: 'Ausgeschieden', tone: 'neutral' },
  blocked: { label: 'Gesperrt', tone: 'bad' },
};

/** Badge props for [status] in [labels], with a neutral fallback for unknown values. */
export function badge(labels: Record<string, { label: string; tone: Tone }>, status: string) {
  return labels[status] ?? { label: status, tone: 'neutral' as Tone };
}
