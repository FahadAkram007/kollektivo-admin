'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { CoordinatesHint } from '@/components/ui/coordinates-hint';
import { SectionCard } from '@/components/ui/section-card';
import { SelectField } from '@/components/ui/select-field';
import { TextField } from '@/components/ui/text-field';
import { useAdmin } from '@/features/shell/admin-shell';
import { can } from '@/features/shell/permissions';
import { ActionFeedback, useAction } from '@/lib/use-action';

import { categoriesQuery, createShop, regionsQuery } from './shops-api';

const EMPTY = {
  name: '',
  category: '',
  region: 'Lausitz',
  street: '',
  postalCode: '',
  city: '',
  lat: '',
  lng: '',
  commissionPercent: '2',
  phone: '',
  website: '',
  description: '',
  ownerFirstName: '',
  ownerLastName: '',
  ownerEmail: '',
};

/** Sets up a checked shop: active at once, with till, printed QR code and commission; the owner is invited. */
export function NewShopScreen() {
  const router = useRouter();
  const { role } = useAdmin();
  const categories = useQuery(categoriesQuery);
  const regions = useQuery(regionsQuery);
  const [form, setForm] = useState(EMPTY);
  const action = useAction([['shops']]);

  if (!can.manage(role)) return <p className="px-4 text-ink-muted md:px-8">Nur für die Rolle Admin.</p>;

  const field = (key: keyof typeof EMPTY) => ({
    value: form[key],
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm({ ...form, [key]: event.target.value }),
  });
  const number = (text: string) => Number(text.replace(',', '.'));

  async function submit() {
    let id = '';
    const ok = await action.run(async () => {
      id = await createShop({
        name: form.name,
        category: form.category,
        region: form.region,
        street: form.street,
        postalCode: form.postalCode.trim(),
        city: form.city,
        lat: number(form.lat),
        lng: number(form.lng),
        commissionPercent: number(form.commissionPercent),
        ownerEmail: form.ownerEmail.trim(),
        ownerFirstName: form.ownerFirstName,
        ownerLastName: form.ownerLastName,
        phone: form.phone || undefined,
        website: form.website || undefined,
        description: form.description || undefined,
      });
    }, 'Laden angelegt.');
    if (ok) router.push(`/laeden/${id}`);
  }

  return (
    <form
      className="flex max-w-3xl flex-col gap-5 px-4 pb-8 md:px-8"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <SectionCard
        title="Laden"
        description="Nur Läden anlegen, die KollektivO geprüft hat und mit denen ein Vertrag besteht."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <TextField label="Name (wie in der App)" required {...field('name')} />
          </div>
          <SelectField
            label="Kategorie"
            required
            options={[
              { value: '', label: 'Bitte wählen' },
              ...(categories.data ?? []).map((category) => ({
                value: category.slug,
                label: `${category.group ? `${category.group} › ` : ''}${category.name}${category.needsReview ? ' (genau prüfen)' : ''}`,
              })),
            ]}
            {...field('category')}
          />
          <TextField label="Provision in %" inputMode="decimal" required {...field('commissionPercent')} />
        </div>
      </SectionCard>

      <SectionCard title="Adresse (erste Filiale)">
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
            label="Region"
            options={(regions.data ?? ['Lausitz']).map((region) => ({ value: region, label: region }))}
            {...field('region')}
          />
          <TextField label="Telefon (optional)" type="tel" {...field('phone')} />
          <div className="sm:col-span-2">
            <TextField label="Webseite (optional)" {...field('website')} />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Inhaber/in" description="Bekommt eine E-Mail mit dem Link zum Händlerportal.">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Vorname" required {...field('ownerFirstName')} />
          <TextField label="Nachname" required {...field('ownerLastName')} />
          <div className="sm:col-span-2">
            <TextField label="E-Mail-Adresse" type="email" required {...field('ownerEmail')} />
          </div>
        </div>
      </SectionCard>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={action.busy}>
          Laden anlegen
        </Button>
        <ActionFeedback state={action.state} />
      </div>
    </form>
  );
}
