import type { Metadata } from 'next';

import { TicketScreen } from '@/features/support/ticket-screen';

export const metadata: Metadata = { title: 'Ticket' };

export default function TicketPage() {
  return (
    <div className="pt-6">
      <TicketScreen />
    </div>
  );
}
