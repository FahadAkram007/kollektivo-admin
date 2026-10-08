'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { SectionCard } from '@/components/ui/section-card';
import { TextField } from '@/components/ui/text-field';
import { useAdmin } from '@/features/shell/admin-shell';
import { can } from '@/features/shell/permissions';
import { berlinToday, formatDay } from '@/lib/berlin-date';
import { percent } from '@/lib/labels';
import { ActionFeedback, useAction } from '@/lib/use-action';

import { changeCommission, shopQuery, type ShopDetail } from './shops-api';

/** Commission history; a new rate starts on a chosen day, payments before keep their rate. */
export function CommissionSection({ shop }: { shop: ShopDetail }) {
  const { role } = useAdmin();
  const [form, setForm] = useState({ ratePercent: '', validFrom: '', reason: '' });
  const action = useAction([shopQuery(shop.partnerId).queryKey, ['shops']]);

  return (
    <SectionCard title="Provision" description="Bereits gemachte Zahlungen behalten ihren Satz.">
      <table className="w-full text-sm">
        <thead className="text-left text-ink-muted">
          <tr>
            <th className="py-1 font-medium">Satz</th>
            <th className="py-1 font-medium">Gültig</th>
            <th className="py-1 font-medium">Grund</th>
          </tr>
        </thead>
        <tbody>
          {shop.commissionRates.map((rate) => (
            <tr key={rate.validFrom} className="border-t border-line">
              <td className="py-2 font-medium tabular-nums">{percent(rate.rateBps)}</td>
              <td className="py-2 tabular-nums">
                ab {formatDay(rate.validFrom)}
                {rate.validTo ? ` bis ${formatDay(rate.validTo)}` : ''}
              </td>
              <td className="py-2 text-ink-muted">{rate.reason ?? '–'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {can.changeCommission(role) && (
        <form
          className="grid gap-3 border-t border-line pt-4 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            void action
              .run(
                () =>
                  changeCommission(shop.partnerId, {
                    ratePercent: Number(form.ratePercent.replace(',', '.')),
                    validFrom: form.validFrom,
                    reason: form.reason,
                  }),
                'Neuer Satz gespeichert.',
              )
              .then((ok) => ok && setForm({ ratePercent: '', validFrom: '', reason: '' }));
          }}
        >
          <TextField
            label="Neuer Satz in %"
            inputMode="decimal"
            required
            value={form.ratePercent}
            onChange={(e) => setForm({ ...form, ratePercent: e.target.value })}
          />
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Gültig ab
            <input
              type="date"
              required
              min={berlinToday()}
              value={form.validFrom}
              onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
              className="min-h-12 rounded-xl border border-line px-4 font-normal"
            />
          </label>
          <div className="sm:col-span-2">
            <TextField
              label="Grund (z. B. Vertragsnachtrag)"
              required
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-4 sm:col-span-2">
            <Button type="submit" variant="secondary" disabled={action.busy}>
              Provision ändern
            </Button>
            <ActionFeedback state={action.state} />
          </div>
        </form>
      )}
    </SectionCard>
  );
}
