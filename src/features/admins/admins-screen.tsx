'use client';

import { queryOptions, useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { SectionCard } from '@/components/ui/section-card';
import { SelectField } from '@/components/ui/select-field';
import { Spinner } from '@/components/ui/spinner';
import { StatusBadge } from '@/components/ui/status-badge';
import { TextField } from '@/components/ui/text-field';
import { ROLE_LABELS } from '@/features/shell/admin-nav';
import { api, unwrap, type Schemas } from '@/lib/api-client';
import { formatDateTime } from '@/lib/date-time';
import { ActionFeedback, useAction } from '@/lib/use-action';

type AdminAccount = Schemas['AdminAccountDto'];
type Role = AdminAccount['role'];

const adminsQuery = queryOptions({
  queryKey: ['admins'],
  queryFn: async () => unwrap(await api.GET('/v1/admin/admins')),
});

const ROLE_OPTIONS = (Object.keys(ROLE_LABELS) as Role[]).map((role) => ({ value: role, label: ROLE_LABELS[role] }));
const ROLE_HELP: Record<Role, string> = {
  admin: 'alles, auch Admins und Protokoll',
  support: 'Tickets, Suche, Konten sperren, Einladungen',
  finance: 'Dashboard, Läden und Firmen lesen, Provision ändern',
};

/** "Admins": who on the KollektivO team has access, with which role. */
export function AdminsScreen() {
  const admins = useQuery(adminsQuery);
  if (admins.isPending) return <Spinner />;
  if (admins.isError) return <p className="px-4 text-ink-muted md:px-8">Die Admins konnten nicht geladen werden.</p>;

  return (
    <div className="grid gap-5 px-4 pb-8 md:px-8 xl:grid-cols-[3fr_2fr]">
      <SectionCard title="Zugänge" description="Es gibt immer mindestens eine Person mit der Rolle Admin.">
        <ul className="flex flex-col divide-y divide-line">
          {admins.data.map((admin) => (
            <AdminRow key={`${admin.userId}-${admin.role}`} admin={admin} />
          ))}
        </ul>
        <div className="text-xs text-ink-muted">
          {ROLE_OPTIONS.map((role) => (
            <p key={role.value}>
              <strong>{role.label}:</strong> {ROLE_HELP[role.value]}
            </p>
          ))}
        </div>
      </SectionCard>
      <AddAdmin />
    </div>
  );
}

function AdminRow({ admin }: { admin: AdminAccount }) {
  const action = useAction([adminsQuery.queryKey]);
  const name = `${admin.firstName} ${admin.lastName}`.trim() || admin.email;

  return (
    <li className="flex flex-col gap-2 py-3 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-medium">
            {name} {admin.isYou && <span className="font-normal text-ink-muted">(Sie)</span>}
          </p>
          <p className="text-ink-muted">{admin.email}</p>
          <p className="text-xs text-ink-muted">
            {admin.lastSignInAt ? `Zuletzt angemeldet ${formatDateTime(admin.lastSignInAt)}` : 'Noch nie angemeldet'}
          </p>
        </div>
        <StatusBadge
          {...(admin.twoFactorReady
            ? { label: '2FA eingerichtet', tone: 'good' }
            : { label: '2FA fehlt', tone: 'warn' })}
        />
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-40">
          <SelectField
            label="Rolle"
            value={admin.role}
            disabled={action.busy}
            options={ROLE_OPTIONS}
            onChange={(event) =>
              void action.run(async () => {
                unwrap(
                  await api.PATCH('/v1/admin/admins/{userId}', {
                    params: { path: { userId: admin.userId } },
                    body: { role: event.target.value as Role },
                  }),
                );
              }, 'Rolle geändert.')
            }
          />
        </div>
        {!admin.isYou && (
          <>
            <Button
              variant="secondary"
              disabled={action.busy}
              onClick={() => {
                if (
                  window.confirm(
                    `2FA von ${name} zurücksetzen? Die Person wird abgemeldet und richtet die App neu ein.`,
                  )
                ) {
                  void action.run(async () => {
                    unwrap(
                      await api.POST('/v1/admin/admins/{userId}/reset-2fa', {
                        params: { path: { userId: admin.userId } },
                      }),
                    );
                  }, '2FA zurückgesetzt.');
                }
              }}
            >
              2FA zurücksetzen
            </Button>
            <Button
              variant="danger"
              disabled={action.busy}
              onClick={() => {
                if (window.confirm(`Zugang von ${name} entfernen?`)) {
                  void action.run(async () => {
                    unwrap(
                      await api.DELETE('/v1/admin/admins/{userId}', { params: { path: { userId: admin.userId } } }),
                    );
                  }, 'Entfernt.');
                }
              }}
            >
              Entfernen
            </Button>
          </>
        )}
      </div>
      <ActionFeedback state={action.state} />
    </li>
  );
}

function AddAdmin() {
  const empty = { firstName: '', lastName: '', email: '', role: 'support' as Role };
  const [form, setForm] = useState(empty);
  const action = useAction([adminsQuery.queryKey]);

  return (
    <SectionCard
      title="Person hinzufügen"
      description="Bekommt eine E-Mail mit dem Link; beim ersten Anmelden richtet sie die Authenticator-App ein."
    >
      <form
        className="grid gap-3 sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          void action
            .run(async () => {
              unwrap(await api.POST('/v1/admin/admins', { body: { ...form, email: form.email.trim() } }));
            }, `Zugang für ${form.email.trim()} erteilt.`)
            .then((ok) => ok && setForm(empty));
        }}
      >
        <TextField
          label="Vorname"
          required
          value={form.firstName}
          onChange={(e) => setForm({ ...form, firstName: e.target.value })}
        />
        <TextField
          label="Nachname"
          required
          value={form.lastName}
          onChange={(e) => setForm({ ...form, lastName: e.target.value })}
        />
        <div className="sm:col-span-2">
          <TextField
            label="E-Mail-Adresse"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div className="sm:col-span-2">
          <SelectField
            label="Rolle"
            value={form.role}
            options={ROLE_OPTIONS}
            onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
          />
        </div>
        <div className="flex items-center gap-4 sm:col-span-2">
          <Button type="submit" disabled={action.busy}>
            Zugang erteilen
          </Button>
          <ActionFeedback state={action.state} />
        </div>
      </form>
    </SectionCard>
  );
}
