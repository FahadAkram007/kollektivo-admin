import type { Metadata } from 'next';

import { PageHeader } from '@/components/ui/page-header';
import { AuditScreen } from '@/features/audit/audit-screen';

export const metadata: Metadata = { title: 'Protokoll' };

export default function Page() {
  return (
    <>
      <PageHeader title="Protokoll" />
      <AuditScreen />
    </>
  );
}
