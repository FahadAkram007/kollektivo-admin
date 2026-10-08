import type { Metadata } from 'next';

import { PageHeader } from '@/components/ui/page-header';
import { AdminsScreen } from '@/features/admins/admins-screen';

export const metadata: Metadata = { title: 'Admins' };

export default function Page() {
  return (
    <>
      <PageHeader title="Admins" />
      <AdminsScreen />
    </>
  );
}
