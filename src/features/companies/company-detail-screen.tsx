'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { CoordinatesHint } from '@/components/ui/coordinates-hint';
import { InviteMemberForm } from '@/components/ui/invite-member-form';
import { MemberList } from '@/components/ui/member-list';
import { SectionCard } from '@/components/ui/section-card';
import { Spinner } from '@/components/ui/spinner';
import { StatusBadge } from '@/components/ui/status-badge';
import { TextField } from '@/components/ui/text-field';
import { useAdmin } from '@/features/shell/admin-shell';
import { can } from '@/features/shell/permissions';
import { formatDay } from '@/lib/berlin-date';
import { formatCents } from '@/lib/format';
import { COMPANY_STATUS } from '@/lib/labels';
import { ActionFeedback, useAction } from '@/lib/use-action';

import { companyQuery, inviteHr, updateCompany, type CompanyDetail } from './companies-api';

const HR_ROLES = { owner: 'Inhaber/in', hr: 'HR' };

/** Everything about one employer for the KollektivO team. */
export function CompanyDetailScreen() {
  const { employerId } = useParams<{ employerId: string }>();
  const { role } = useAdmin();
  const company = useQuery(companyQuery(employerId));

  if (company.isPending) return <Spinner />;
  if (company.isError) return <p className="px-4 text-ink-muted md:px-8">Die Firma konnte nicht geladen werden.</p>;
  const data = company.data;

  return (
    <div className="flex flex-col gap-5 px-4 pb-8 md:px-8">
      <Link href="/firmen" className="text-sm text-brand-purple hover:underline">
        ← Alle Firmen
      </Link>
      <header className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">{data.name}</h1>
        <StatusBadge {...(COMPANY_STATUS[data.status] ?? { label: data.status, tone: 'neutral' })} />
        <span className="text-sm text-ink-muted">seit {formatDay(data.createdAt.slice(0, 10))}</span>
      </header>
      <Employees company={data} />
      <div className="grid gap-5 xl:grid-cols-2">
        <MasterData key={data.name + data.street + data.billingEmail} company={data} />
        <div className="flex flex-col gap-5">
          <SectionCard title="Firmenportal-Zugänge (HR)">
            <MemberList members={data.members} roleLabels={HR_ROLES} />
            {can.invite(role) && (
              <InviteMemberForm
                roles={[
                  { value: 'hr', label: HR_ROLES.hr },
                  { value: 'owner', label: HR_ROLES.owner },
                ]}
                invite={(input) => inviteHr(employerId, { ...input, role: input.role as 'owner' | 'hr' })}
                queryKey={companyQuery(employerId).queryKey}
              />
            )}
          </SectionCard>
          <Months company={data} />
        </div>
      </div>
    </div>
  );
}

function Employees({ company }: { company: CompanyDetail }) {
  const items = [
    { label: 'Aktiv', value: company.employees.active },
    { label: 'Scheiden aus', value: company.employees.leaving },
    { label: 'Offene Einladungen', value: company.employees.openInvites },
    { label: 'Ausgeschieden', value: company.employees.ended },
    { label: 'Gesperrt', value: company.employees.blocked },
  ];
  return (
    <dl className="grid grid-cols-2 gap-3 md:grid-cols-5">
      {items.map((item) => (
        <div key={item.label} className="rounded-xl bg-surface p-3">
          <dt className="text-xs text-ink-muted">{item.label}</dt>
          <dd className="text-xl font-bold tabular-nums">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Months({ company }: { company: CompanyDetail }) {
  return (
    <SectionCard title="Monate">
      {company.months.length === 0 ? (
        <p className="text-sm text-ink-muted">Noch keine Gutschriften.</p>
      ) : (
        <table className="w-full text-sm">
          <thead className="text-left text-ink-muted">
            <tr>
              <th className="py-1 font-medium">Monat</th>
              <th className="py-1 text-right font-medium">Personen</th>
              <th className="py-1 text-right font-medium">Gutgeschrieben</th>
              <th className="py-1 text-right font-medium">Ausgegeben</th>
              <th className="py-1 text-right font-medium">Zurück / offen</th>
            </tr>
          </thead>
          <tbody>
            {company.months.map((month) => (
              <tr key={month.period} className="border-t border-line tabular-nums">
                <td className="py-2">{month.period}</td>
                <td className="py-2 text-right">{month.employeeCount}</td>
                <td className="py-2 text-right">{formatCents(month.creditedCents)}</td>
                <td className="py-2 text-right">{formatCents(month.spentCents)}</td>
                <td className="py-2 text-right">
                  {month.closed ? formatCents(month.returnedCents) : `${formatCents(month.openCents)} offen`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </SectionCard>
  );
}

function MasterData({ company }: { company: CompanyDetail }) {
  const { role } = useAdmin();
  const editable = can.manage(role);
  const [form, setForm] = useState({
    name: company.name,
    street: company.street,
    postalCode: company.postalCode,
    city: company.city,
    lat: String(company.lat),
    lng: String(company.lng),
    billingEmail: company.billingEmail,
    vatId: company.vatId ?? '',
  });
  const save = useAction([companyQuery(company.employerId).queryKey, ['companies']]);
  const status = useAction([companyQuery(company.employerId).queryKey, ['companies']]);
  const field = (key: keyof typeof form) => ({
    value: form[key],
    disabled: !editable,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: event.target.value }),
  });

  return (
    <SectionCard title="Stammdaten" description={`Region: ${company.region}`}>
      <form
        className="grid gap-4 sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          void save.run(() =>
            updateCompany(company.employerId, {
              ...form,
              lat: Number(form.lat.replace(',', '.')),
              lng: Number(form.lng.replace(',', '.')),
            }),
          );
        }}
      >
        <div className="sm:col-span-2">
          <TextField label="Firmenname" {...field('name')} />
        </div>
        <div className="sm:col-span-2">
          <TextField label="Straße und Hausnummer" {...field('street')} />
        </div>
        <TextField label="PLZ" maxLength={5} {...field('postalCode')} />
        <TextField label="Ort" {...field('city')} />
        <TextField label="Breite (lat)" inputMode="decimal" {...field('lat')} />
        <TextField label="Länge (lng)" inputMode="decimal" {...field('lng')} />
        {editable && (
          <div className="sm:col-span-2">
            <CoordinatesHint />
          </div>
        )}
        <TextField label="E-Mail für Rechnungen" type="email" {...field('billingEmail')} />
        <TextField label="USt-IdNr." {...field('vatId')} />
        {editable && (
          <div className="flex items-center gap-4 sm:col-span-2">
            <Button type="submit" variant="secondary" disabled={save.busy}>
              Speichern
            </Button>
            <ActionFeedback state={save.state} />
          </div>
        )}
      </form>
      {editable && (
        <div className="flex flex-col gap-2 border-t border-line pt-4">
          {company.status === 'active' ? (
            <>
              <p className="text-sm text-ink-muted">
                Beenden (z. B. Vertrag gekündigt): Ab dem nächsten Monat gibt es für niemanden mehr Gutschriften.
              </p>
              <Button
                variant="danger"
                className="self-start"
                disabled={status.busy}
                onClick={() => {
                  if (window.confirm(`Zusammenarbeit mit ${company.name} wirklich beenden?`)) {
                    void status.run(() => updateCompany(company.employerId, { status: 'ended' }), 'Beendet.');
                  }
                }}
              >
                Zusammenarbeit beenden
              </Button>
            </>
          ) : (
            <Button
              className="self-start"
              disabled={status.busy}
              onClick={() =>
                void status.run(() => updateCompany(company.employerId, { status: 'active' }), 'Aktiviert.')
              }
            >
              Wieder aktivieren
            </Button>
          )}
          <ActionFeedback state={status.state} />
        </div>
      )}
    </SectionCard>
  );
}
