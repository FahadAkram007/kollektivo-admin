import type { Metadata } from 'next';

import { PageHeader } from '@/components/ui/page-header';
import { NewCompanyScreen } from '@/features/companies/new-company-screen';

export const metadata: Metadata = { title: 'Neue Firma' };

export default function Page() {
  return (
    <>
      <PageHeader title="Neue Firma" />
      <NewCompanyScreen />
    </>
  );
}
