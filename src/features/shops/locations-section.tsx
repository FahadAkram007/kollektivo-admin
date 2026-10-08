'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { CoordinatesHint } from '@/components/ui/coordinates-hint';
import { Modal } from '@/components/ui/modal';
import { SectionCard } from '@/components/ui/section-card';
import { SelectField } from '@/components/ui/select-field';
import { StatusBadge } from '@/components/ui/status-badge';
import { TextField } from '@/components/ui/text-field';
import { useAdmin } from '@/features/shell/admin-shell';
import { can } from '@/features/shell/permissions';
import { LOCATION_STATUS } from '@/lib/labels';
import { ActionFeedback, useAction } from '@/lib/use-action';

import { shopQuery, updateLocation, type ShopDetail, type ShopLocation } from './shops-api';

/** The shop's branches; address, coordinates and status can be corrected. */
export function LocationsSection({ shop }: { shop: ShopDetail }) {
  const { role } = useAdmin();
  const [editing, setEditing] = useState<ShopLocation | null>(null);

  return (
    <SectionCard title={shop.locations.length === 1 ? 'Filiale' : `Filialen (${shop.locations.length})`}>
      <ul className="flex flex-col divide-y divide-line">
        {shop.locations.map((location) => (
          <li key={location.id} className="flex flex-wrap items-start justify-between gap-3 py-3 text-sm">
            <div>
              <p className="font-medium">
                {location.street}, {location.postalCode} {location.city}
              </p>
              <p className="text-ink-muted">
                {location.region} · {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                {location.phone ? ` · ${location.phone}` : ''}
              </p>
              {location.printedQrPayload && (
                <p className="font-mono text-xs text-ink-muted">QR: {location.printedQrPayload}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge {...(LOCATION_STATUS[location.status] ?? { label: location.status, tone: 'neutral' })} />
              {can.manage(role) && (
                <button className="text-brand-purple hover:underline" onClick={() => setEditing(location)}>
                  Bearbeiten
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
      {editing && <LocationDialog partnerId={shop.partnerId} location={editing} onClose={() => setEditing(null)} />}
    </SectionCard>
  );
}

function LocationDialog({
  partnerId,
  location,
  onClose,
}: {
  partnerId: string;
  location: ShopLocation;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    street: location.street,
    postalCode: location.postalCode,
    city: location.city,
    lat: String(location.lat),
    lng: String(location.lng),
    status: location.status,
  });
  const action = useAction([shopQuery(partnerId).queryKey]);
  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm({ ...form, [key]: event.target.value }),
  });

  return (
    <Modal title="Filiale bearbeiten" onClose={onClose}>
      <form
        className="grid gap-4 sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          void action.run(() =>
            updateLocation(partnerId, location.id, {
              street: form.street,
              postalCode: form.postalCode,
              city: form.city,
              lat: Number(form.lat.replace(',', '.')),
              lng: Number(form.lng.replace(',', '.')),
              status: form.status as 'active' | 'paused' | 'closed',
            }),
          );
        }}
      >
        <div className="sm:col-span-2">
          <TextField label="Straße und Hausnummer" required {...field('street')} />
        </div>
        <TextField label="PLZ" maxLength={5} required {...field('postalCode')} />
        <TextField label="Ort" required {...field('city')} />
        <TextField label="Breite (lat)" inputMode="decimal" required {...field('lat')} />
        <TextField label="Länge (lng)" inputMode="decimal" required {...field('lng')} />
        <div className="sm:col-span-2">
          <CoordinatesHint />
        </div>
        <div className="sm:col-span-2">
          <SelectField
            label="Status"
            options={Object.entries(LOCATION_STATUS).map(([value, { label }]) => ({ value, label }))}
            {...field('status')}
          />
          <p className="mt-1 text-xs text-ink-muted">Pausiert oder geschlossen: nicht in der App, keine Zahlungen.</p>
        </div>
        <div className="flex items-center gap-4 sm:col-span-2">
          <Button type="submit" disabled={action.busy}>
            Speichern
          </Button>
          <ActionFeedback state={action.state} />
        </div>
      </form>
    </Modal>
  );
}
