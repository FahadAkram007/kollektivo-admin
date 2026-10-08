import type { Metadata } from 'next';

import { PageHeader } from '@/components/ui/page-header';
import { CompanyListScreen } from '@/features/companies/company-list-screen';

export const metadata: Metadata = { title: 'Firmen' };

export default function Page() {
  return (
    <>
      <PageHeader title="Firmen" />
      <CompanyListScreen />
    </>
  );
}
