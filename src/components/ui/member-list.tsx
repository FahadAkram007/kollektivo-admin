import { StatusBadge } from './status-badge';

export interface MemberView {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  hasSignedIn: boolean;
}

/** People with portal access (shop team or HR), with role and whether they signed in yet. */
export function MemberList({ members, roleLabels }: { members: MemberView[]; roleLabels: Record<string, string> }) {
  if (members.length === 0) return <p className="text-sm text-ink-muted">Noch niemand.</p>;
  return (
    <ul className="flex flex-col divide-y divide-line">
      {members.map((member) => (
        <li key={member.userId} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
          <div className="min-w-0">
            <p className="font-medium">
              {`${member.firstName} ${member.lastName}`.trim() || member.email}{' '}
              <span className="font-normal text-ink-muted">· {roleLabels[member.role] ?? member.role}</span>
            </p>
            <p className="truncate text-ink-muted">{member.email}</p>
          </div>
          <StatusBadge
            {...(member.hasSignedIn ? { label: 'Aktiv', tone: 'good' } : { label: 'Eingeladen', tone: 'warn' })}
          />
        </li>
      ))}
    </ul>
  );
}
