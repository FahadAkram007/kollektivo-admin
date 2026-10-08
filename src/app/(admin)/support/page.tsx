import type { Metadata } from 'next';

import { PageHeader } from '@/components/ui/page-header';
import { TicketListScreen } from '@/features/support/ticket-list-screen';

export const metadata: Metadata = { title: 'Support' };

export default function Page() {
  return (
    <>
      <PageHeader title="Support" />
      <TicketListScreen />
    </>
  );
}
