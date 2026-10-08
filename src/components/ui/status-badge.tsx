const TONES = {
  good: 'bg-green-50 text-success',
  warn: 'bg-amber-50 text-ink',
  bad: 'bg-red-50 text-error',
  neutral: 'bg-surface text-ink-muted',
} as const;

export type Tone = keyof typeof TONES;

export function StatusBadge({ label, tone }: { label: string; tone: Tone }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${TONES[tone]}`}>{label}</span>
  );
}
