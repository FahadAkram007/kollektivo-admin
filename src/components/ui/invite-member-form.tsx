'use client';

import { useState } from 'react';

import { ActionFeedback, useAction } from '@/lib/use-action';

import { Button } from './button';
import { SelectField } from './select-field';
import { TextField } from './text-field';

export interface InviteInput {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

/** Invite a person to a portal, or send an existing person the invitation again (same email). */
export function InviteMemberForm({
  roles,
  invite,
  queryKey,
}: {
  roles: { value: string; label: string }[];
  invite: (input: InviteInput) => Promise<void>;
  queryKey: readonly unknown[];
}) {
  const empty = { email: '', firstName: '', lastName: '', role: roles[0].value };
  const [form, setForm] = useState(empty);
  const action = useAction([queryKey]);
  const field = (key: keyof typeof empty) => ({
    value: form[key],
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm({ ...form, [key]: event.target.value }),
  });

  return (
    <form
      className="grid gap-3 border-t border-line pt-4 sm:grid-cols-2"
      onSubmit={(event) => {
        event.preventDefault();
        void action
          .run(() => invite({ ...form, email: form.email.trim() }), `Einladung an ${form.email.trim()} gesendet.`)
          .then((ok) => ok && setForm(empty));
      }}
    >
      <p className="text-sm text-ink-muted sm:col-span-2">
        Person einladen – oder Einladung erneut senden (gleiche E-Mail-Adresse). Achtung: Die Rolle wird dabei
        überschrieben.
      </p>
      <TextField label="Vorname" required {...field('firstName')} />
      <TextField label="Nachname" required {...field('lastName')} />
      <TextField label="E-Mail-Adresse" type="email" required {...field('email')} />
      <SelectField label="Rolle" options={roles} {...field('role')} />
      <div className="flex items-center gap-4 sm:col-span-2">
        <Button type="submit" variant="secondary" disabled={action.busy}>
          Einladung senden
        </Button>
        <ActionFeedback state={action.state} />
      </div>
    </form>
  );
}
