'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { CoordinatesHint } from '@/components/ui/coordinates-hint';
import { SectionCard } from '@/components/ui/section-card';
import { SelectField } from '@/components/ui/select-field';
import { TextField } from '@/components/ui/text-field';
import { regionsQuery } from '@/features/shops/shops-api';
import { useAdmin } from '@/features/shell/admin-shell';
import { can } from '@/features/shell/permissions';
import { ActionFeedback, useAction } from '@/lib/use-action';

import { createCompany } from './companies-api';

const EMPTY = {
  name: '',
  region: 'Lausitz',
  street: '',
  postalCode: '',
  city: '',
  lat: '',
  lng: '',
  billingEmail: '',
  vatId: '',
  hrFirstName: '',
  hrLastName: '',
  hrEmail: '',
};

/** Sets up an employer after the contract; the HR person gets access to the company portal. */
export function NewCompanyScreen() {
  const router = useRouter();
  const { role } = useAdmin();
  const regions = useQuery(regionsQuery);
  const [form, setForm] = useState(EMPTY);
  const action = useAction([['companies']]);

  if (!can.manage(role)) return <p className="px-4 text-ink-muted md:px-8">Nur für die Rolle Admin.</p>;

  const field = (key: keyof typeof EMPTY) => ({
    value: form[key],
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm({ ...form, [key]: event.target.value }),
  });
  const number = (text: string) => Number(text.replace(',', '.'));

  async function submit() {
    let id = '';
    const ok = await action.run(async () => {
      id = await createCompany({
        ...form,
        postalCode: form.postalCode.trim(),
        lat: number(form.lat),
        lng: number(form.lng),
        billingEmail: form.billingEmail.trim(),
        hrEmail: form.hrEmail.trim(),
        vatId: form.vatId.trim() || undefined,
      });
    }, 'Firma angelegt.');
    if (ok) router.push(`/firmen/${id}`);
  }

  return (
    <form
      className="flex max-w-3xl flex-col gap-5 px-4 pb-8 md:px-8"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <SectionCard title="Firma" description="Nach Vertragsabschluss anlegen. Die Firma ist sofort aktiv.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <TextField label="Firmenname" required {...field('name')} />
          </div>
          <TextField label="E-Mail für Rechnungen" type="email" required {...field('billingEmail')} />
          <TextField label="USt-IdNr. (optional)" {...field('vatId')} />
        </div>
      </SectionCard>

      <SectionCard
        title="Arbeitsort"
        description="Mittelpunkt der Karte in der App, wenn Mitarbeitende ihren Standort nicht teilen."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <TextField label="Straße und Hausnummer" required {...field('street')} />
          </div>
          <TextField label="PLZ" inputMode="numeric" maxLength={5} required {...field('postalCode')} />
          <TextField label="Ort" required {...field('city')} />
          <TextField label="Breite (lat)" inputMode="decimal" required {...field('lat')} />
          <TextField label="Länge (lng)" inputMode="decimal" required {...field('lng')} />
          <div className="sm:col-span-2">
            <CoordinatesHint />
          </div>
          <SelectField
            label="Region (welche Läden die Mitarbeitenden sehen)"
            options={(regions.data ?? ['Lausitz']).map((region) => ({ value: region, label: region }))}
            {...field('region')}
          />
        </div>
      </SectionCard>

      <SectionCard title="HR-Ansprechperson" description="Bekommt Zugang zum Firmenportal (Rolle Inhaber/in).">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Vorname" required {...field('hrFirstName')} />
          <TextField label="Nachname" required {...field('hrLastName')} />
          <div className="sm:col-span-2">
            <TextField label="E-Mail-Adresse" type="email" required {...field('hrEmail')} />
          </div>
        </div>
      </SectionCard>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={action.busy}>
          Firma anlegen
        </Button>
        <ActionFeedback state={action.state} />
      </div>
    </form>
  );
}
