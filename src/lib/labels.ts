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
