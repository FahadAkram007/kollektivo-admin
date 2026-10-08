'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { SectionCard } from '@/components/ui/section-card';
import { SelectField } from '@/components/ui/select-field';
import { TextField } from '@/components/ui/text-field';
import { useAdmin } from '@/features/shell/admin-shell';
import { can } from '@/features/shell/permissions';
import { ActionFeedback, useAction } from '@/lib/use-action';

import { categoriesQuery, shopQuery, updateShop, type ShopDetail } from './shops-api';

/** Names, category and status (suspend / activate). */
export function MasterDataSection({ shop }: { shop: ShopDetail }) {
  const { role } = useAdmin();
  const categories = useQuery(categoriesQuery);
  const [form, setForm] = useState({
    legalName: shop.legalName,
    displayName: shop.displayName,
    category: shop.category,
  });
  const save = useAction([shopQuery(shop.partnerId).queryKey, ['shops']]);
  const status = useAction([shopQuery(shop.partnerId).queryKey, ['shops']]);
  const editable = can.manage(role);

  return (
    <SectionCard title="Stammdaten">
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          void save.run(() => updateShop(shop.partnerId, form));
        }}
      >
        <TextField
          label="Firmenname (rechtlich)"
          disabled={!editable}
          value={form.legalName}
          onChange={(e) => setForm({ ...form, legalName: e.target.value })}
        />
        <TextField
          label="Name in der App"
          disabled={!editable}
          value={form.displayName}
          onChange={(e) => setForm({ ...form, displayName: e.target.value })}
        />
        <SelectField
          label="Kategorie"
          disabled={!editable}
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          options={(categories.data ?? [{ slug: shop.category, name: shop.categoryName }]).map((category) => ({
            value: category.slug,
            label: category.name,
          }))}
        />
        {shop.website && (
          <p className="text-sm">
            Webseite:{' '}
            <a href={shop.website} target="_blank" rel="noreferrer" className="text-brand-purple underline">
              {shop.website}
            </a>
          </p>
        )}
        {editable && (
          <div className="flex items-center gap-4">
            <Button type="submit" variant="secondary" disabled={save.busy}>
              Speichern
            </Button>
            <ActionFeedback state={save.state} />
          </div>
        )}
      </form>
      {editable && (
        <div className="flex flex-col gap-2 border-t border-line pt-4">
          {shop.status === 'active' ? (
            <>
              <p className="text-sm text-ink-muted">
                Sperren: Der Laden verschwindet aus der App und kann keine Zahlungen mehr annehmen.
              </p>
              <Button
                variant="danger"
                className="self-start"
                disabled={status.busy}
                onClick={() => {
                  if (window.confirm(`${shop.displayName} wirklich sperren?`)) {
                    void status.run(() => updateShop(shop.partnerId, { status: 'suspended' }), 'Gesperrt.');
                  }
                }}
              >
                Laden sperren
              </Button>
            </>
          ) : (
            <Button
              className="self-start"
              disabled={status.busy}
              onClick={() => void status.run(() => updateShop(shop.partnerId, { status: 'active' }), 'Aktiviert.')}
            >
              Laden aktivieren
            </Button>
          )}
          <ActionFeedback state={status.state} />
        </div>
      )}
    </SectionCard>
  );
}
