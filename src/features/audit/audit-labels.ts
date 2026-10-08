/** German names for the audit actions; unknown ones are shown as they are. */
export const ACTION_LABELS: Record<string, string> = {
  'admin.granted': 'Admin-Zugang erteilt',
  'admin.removed': 'Admin-Zugang entfernt',
  'admin.role_changed': 'Admin-Rolle geändert',
  'admin.signed_in': 'Im Adminportal angemeldet',
  'admin.locked_out': 'Gesperrt nach falschen 2FA-Codes',
  'admin.totp_reset': '2FA zurückgesetzt',
  'partner.created': 'Laden angelegt',
  'partner.updated': 'Laden geändert',
  'partner.active': 'Laden aktiviert',
  'partner.suspended': 'Laden gesperrt',
  'partner.commission_changed': 'Provision geändert',
  'partner.member_invited': 'Händlerportal-Einladung gesendet',
  'partner.member_added': 'Teammitglied hinzugefügt (Laden)',
  'partner.member_removed': 'Teammitglied entfernt (Laden)',
  'partner_location.updated': 'Filiale geändert',
  'employer.created': 'Firma angelegt',
  'employer.updated': 'Firma geändert',
  'employer.active': 'Firma aktiviert',
  'employer.ended': 'Zusammenarbeit mit Firma beendet',
  'employer.hr_invited': 'Firmenportal-Einladung gesendet',
  'employer.hr_added': 'HR-Person hinzugefügt',
  'employer.hr_removed': 'HR-Person entfernt',
  'employee.updated': 'Monatsbetrag/Personalnummer geändert',
  'employee.leaving_set': 'Austritt festgelegt',
  'employee.leaving_cancelled': 'Austritt zurückgenommen',
  'employee.blocked': 'Mitarbeiter/in gesperrt (HR)',
  'employee.unblocked': 'Mitarbeiter/in entsperrt (HR)',
  'user.blocked': 'Konto gesperrt',
  'user.unblocked': 'Konto entsperrt',
  'person.viewed': 'Person angesehen',
  'payment.viewed': 'Zahlung angesehen',
  'ticket.answered': 'Ticket beantwortet',
  'ticket.status_changed': 'Ticket-Status geändert',
};

export const ACTION_FILTERS = [
  { value: '', label: 'Alle' },
  { value: 'admin.', label: 'Admins' },
  { value: 'partner', label: 'Läden' },
  { value: 'employer.', label: 'Firmen' },
  { value: 'employee.', label: 'Mitarbeitende (HR)' },
  { value: 'user.', label: 'Konten' },
  { value: 'ticket.', label: 'Support' },
  { value: 'person.viewed', label: 'Einsicht Personen' },
  { value: 'payment.viewed', label: 'Einsicht Zahlungen' },
];

/** Link to the record an entry is about, where the admin portal has a page for it. */
export function entityHref(entity: string, entityId: string | null, label: string | null): string | null {
  if (!entityId) return null;
  switch (entity) {
    case 'partner':
      return `/laeden/${entityId}`;
    case 'employer':
      return `/firmen/${entityId}`;
    case 'support_ticket':
      return `/support/${entityId}`;
    case 'user':
    case 'payment':
      return label ? `/suche?q=${encodeURIComponent(label)}` : null;
    case 'employee':
      return label ? `/suche?q=${encodeURIComponent(label.split(' bei ')[0])}` : null;
    default:
      return null;
  }
}
