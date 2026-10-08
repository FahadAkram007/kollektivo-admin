import type { Metadata } from 'next';

import { PageHeader } from '@/components/ui/page-header';
import { DashboardScreen } from '@/features/dashboard/dashboard-screen';

export const metadata: Metadata = { title: 'Dashboard' };

export default function DashboardPage() {
  return (
    <>
      <PageHeader title="Dashboard" />
      <DashboardScreen />
    </>
  );
}
