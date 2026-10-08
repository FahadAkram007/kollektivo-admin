import type { Metadata } from 'next';

import { PageHeader } from '@/components/ui/page-header';
import { SearchScreen } from '@/features/search/search-screen';

export const metadata: Metadata = { title: 'Suche' };

export default function Page() {
  return (
    <>
      <PageHeader title="Suche" />
      <SearchScreen />
    </>
  );
}
